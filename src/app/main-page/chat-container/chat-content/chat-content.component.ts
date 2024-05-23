import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild, inject } from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { Firestore, collection, getDocs, onSnapshot, orderBy, query } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageComponent } from '../private-message/private-message.component';
import { SelectionService } from '../../../services/selection.service';
import { Subscription } from 'rxjs';
import { OverlayService } from '../../../services/overlay.service';


@Component({
  selector: 'app-chat-content',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, PrivateMessageComponent],
  templateUrl: './chat-content.component.html',
  styleUrl: './chat-content.component.scss'
})
export class ChatContentComponent implements AfterViewInit, OnDestroy {
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  overlayService = inject(OverlayService);
  @ViewChild('chatList') chatList!: ElementRef;
  private selectionIdSubscription: Subscription;
  private unsubscribeChannelMessages: (() => void) | undefined;
  private chatHistoryLoadedSubscription!: Subscription;
  choosenChatId: string = '';
  isLoading: boolean = false;
  messages: any[] = [];


  constructor(private renderer: Renderer2) {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      if (this.selectionService.channelOrDM.value === 'channel') {
        this.choosenChatId = newId;
        if (this.choosenChatId != '') {
          this.subscribeChannelMessagesChanges();
        }
      }
    });
  }

  ngAfterViewInit() {
    this.chatHistoryLoadedSubscription = this.DMService.chatHistoryLoaded$.subscribe(() => {
      setTimeout(() => {
        this.scrollToBottom();
        this.waitForImagesToLoad();
      }, 1);
    });
  }

  scrollToBottom() {
    if (this.chatList) {
      this.renderer.setProperty(this.chatList.nativeElement, 'scrollTop', this.chatList.nativeElement.scrollHeight);
    }
  }

  waitForImagesToLoad() {
    const images = this.chatList.nativeElement.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      images[i].onload = () => this.scrollToBottom();
    }
  }

  subscribeChannelMessagesChanges() {
    if (this.unsubscribeChannelMessages) {
      this.unsubscribeChannelMessages();
    }
    if (this.choosenChatId && this.choosenChatId !== '') {
      const channelsRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages');
      const channelQuery = query(channelsRef);
      this.unsubscribeChannelMessages = onSnapshot(channelQuery, { includeMetadataChanges: true }, (querySnapshot) => {
        this.loadChannelMessages();
      });
    } else {
      return
    }
  }

  formatPostTime(postDate: Date) {
    const hours = postDate.getHours().toString().padStart(2, '0');
    const minutes = postDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatPostDate(postDate: Date) {
    return postDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  createMessage(doc: any) {
    const postDate = new Date(doc.data()['postTime']);
    return {
      text: doc.data()['text'],
      posthour: this.formatPostTime(postDate),
      postDay: this.formatPostDate(postDate),
      reactions: doc.data()['reactions'],
      authorId: doc.data()['authorId'],
      docId: doc.data()['docId']
    };
  }

  async loadChannelMessages() {
    const newMessages: any[] = [];
    const messagesRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('postTime'));

    const querySnapshot = await getDocs(messagesQuery);
    querySnapshot.forEach((doc) => {
      newMessages.push(this.createMessage(doc));
    });

    this.messages = newMessages;
    this.DMService.chatHistoryLoaded.next();
  }

  ngOnDestroy() {
    this.chatHistoryLoadedSubscription.unsubscribe();
    this.selectionIdSubscription.unsubscribe();
    if (this.unsubscribeChannelMessages) {
      this.unsubscribeChannelMessages();
    }
  }

  openMemberView(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleMemberView();
    this.DMService.selectedProfileName = this.DMService.selectedUserName;
    this.DMService.selectedProfileImage = this.DMService.selectedUserImage;
  }

}
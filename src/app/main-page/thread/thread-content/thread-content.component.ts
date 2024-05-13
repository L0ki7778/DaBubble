import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject, Renderer2 } from '@angular/core';
import { ChatAnswerComponent } from './chat-answer/chat-answer.component';
import { Firestore, collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { SelectionService } from '../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { OverlayService } from '../../../services/overlay.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ReactionBarComponent } from '../../chat-container/chat-content/chat-message/reaction-bar/reaction-bar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-thread-content',
  standalone: true,
  imports: [ChatAnswerComponent, CommonModule, PickerComponent, ReactionBarComponent, FormsModule],
  templateUrl: './thread-content.component.html',
  styleUrl: './thread-content.component.scss'
})
export class ThreadContentComponent {

  @Input() answer: any;
  edit: ElementRef | null = null;
  emoji: ElementRef | null = null;
  firestore = inject(Firestore);
  selectionService = inject(SelectionService);
  DMService = inject(DirectMessagesService);
  overlay = inject(OverlayService);
  viewEmojiPicker: boolean = false;
  viewEditEmojiPicker: boolean = false;
  message: any;
  messageUser: any = {};
  currentUserId: string = '';
  answers: any[] = [];
  viewOption: boolean = false;
  isHovered: boolean = false;
  choosenChatId: string = '';
  choosenMessageId: string = '';
  isOwnAnswer: boolean = false;
  editMessage: boolean = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  private selectionIdSubscription: Subscription;
  private unsubscribeChannelMessages: (() => void) | undefined;
  @ViewChild('chatThread') chatThread!: ElementRef;
  selectionMessageIdSubscription?: Subscription;
  unsubscribeMessageAnswers: (() => void) | undefined;
  unsubscribeMessageToAnswer: (() => void) | undefined;
  messageFromDeletedUser: boolean = false;


  constructor(private renderer: Renderer2) {
    this.choosenChatId = this.selectionService.choosenChatTypeId.value;
    if (this.selectionService.channelOrDM.value === 'channel') {
      this.selectionMessageIdSubscription = this.selectionService.choosenMessageId.subscribe(newId => {
        if (this.subscribeMessageAnswerChanges() !== undefined) {
          this.subscribeMessageAnswerChanges();
        }
        if (this.subscribeMessageToAnswer() !== undefined) {
          this.subscribeMessageToAnswer();
        }
        this.choosenMessageId = newId;
        if (this.choosenMessageId !== '') {
          this.answers = [];
          this.subscribeMessageAnswerChanges();
          this.subscribeMessageToAnswer();
        }
      });
    }
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
      if (this.choosenChatId != '') {
        this.subscribeChannelMessagesChanges();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.waitForImagesToLoad();
      this.scrollToBottom();
    }, 1);
  }

  scrollToBottom() {
    if (this.chatThread) {
      this.renderer.setProperty(this.chatThread.nativeElement, 'scrollTop', this.chatThread.nativeElement.scrollHeight);
    }
  }

  waitForImagesToLoad() {
    const images = this.chatThread.nativeElement.getElementsByTagName('img');
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
        this.loadMessageUser();
      });
    } else {
      return
    }
  }

  loadMessageUser() {
    if (this.message && this.message.authorId) {
      const docRef = doc(this.firestore, 'users', this.message.authorId);
      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          this.messageUser = {
            name: doc.data()['name'],
            image: doc.data()['image'],
            id: doc.id
          };
        }
        else {
          this.messageUser = {
            name: 'Gelöschter User',
            image: 'assets/img/start-page/unknown.svg',
            id: ''
          };
          this.messageFromDeletedUser = true;
        }
      });
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

  setMessageData(messageSnapshot: any) {
    const postDate = new Date(messageSnapshot.data()['postTime']);
    this.message = {
      text: messageSnapshot.data()['text'],
      posthour: this.formatPostTime(postDate),
      postDay: this.formatPostDate(postDate),
      reactions: messageSnapshot.data()['reactions'],
      authorId: messageSnapshot.data()['authorId'],
      docId: messageSnapshot.data()['docId']
    }
  }

  subscribeMessageToAnswer() {
    if (this.unsubscribeMessageToAnswer) {
      this.unsubscribeMessageToAnswer();
    }
    if (this.choosenMessageId && this.choosenMessageId !== '') {
      const messageDocRef = doc(this.firestore, 'channels', this.choosenChatId, 'messages', this.choosenMessageId);
      this.unsubscribeMessageAnswers = onSnapshot(messageDocRef, { includeMetadataChanges: true }, (messageSnapshot) => {
        if (messageSnapshot.exists()) {
          this.setMessageData(messageSnapshot);
          this.getCurrentUserId();
          this.loadMessageUser();
        }
      });
    } else {
      return
    }
  }

  pushAnswerData(answer: any) {
    const postDate = new Date(answer.data()['postTime']);
    this.answers.push({
      text: answer.data()['text'],
      posthour: this.formatPostTime(postDate),
      postDay: this.formatPostDate(postDate),
      reactions: answer.data()['reactions'],
      authorId: answer.data()['authorId'],
      docId: answer.data()['docId']
    });
  }

  subscribeMessageAnswerChanges() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.choosenMessageId && this.choosenMessageId !== '' && this.choosenChatId) {
      const messageDocRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages', this.choosenMessageId, 'answers');
      const q = query(messageDocRef, orderBy('postTime'));
      this.unsubscribeMessageAnswers = onSnapshot(q, { includeMetadataChanges: true }, (answersSnapshot) => {
        this.answers = [];
        answersSnapshot.docs.forEach((answer: any) => {
          this.pushAnswerData(answer);
        });
        this.ngAfterViewInit();
      });
    } else {
      return
    }
  }


  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if ((this.edit && this.edit.nativeElement && this.edit.nativeElement.contains(event.target)) ||
      (this.emoji && this.emoji.nativeElement && this.emoji.nativeElement.contains(event.target))) {
      return
    } else {
      this.viewOption = false;
      this.viewEmojiPicker = false;
      this.viewEditEmojiPicker = false;
    }
  }

  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
    if (this.currentUserId === this.message.authorId) {
      this.isOwnAnswer = true;
    }
    else {
      this.isOwnAnswer = false
    }
  }

  showOption(event: MouseEvent) {
    event.stopPropagation();
    this.viewOption = true;
  }

  startEditing(messageId: string, messageText: string) {
    this.editMessage = true;
    this.editingMessageId = messageId;
    this.editingMessageText = this.extractTextFromMessageContent(messageText);
  }

  cancelEditing() {
    this.editingMessageId = null;
    this.editingMessageText = '';
    this.editMessage = false;
  }

  extractTextFromMessageContent(messageContent: string): string {
    const textContainer = messageContent.match(/<div class="text-container">(.*?)<\/div>/s);
    let extractedText = textContainer ? textContainer[1].trim() : messageContent;
    extractedText = extractedText.replace(/<br\/?>/g, '\n');
    return extractedText;
  }

  assembleMessageContent(messageText: string, originalMessageContent: string): string {
    const messageImage = originalMessageContent.match(/<div class="image-box">.*?<\/div>/s)?.[0] || '';
    const textContainer = `<div class="text-container">${messageText.replace(/\n/g, '<br>')}</div>`;
    return `<div class="message-wrapper">${messageImage}${textContainer}</div>`;
  }

  async saveEditedMessage() {
    if (this.choosenChatId && this.selectionService.choosenMessageId.value) {
      const messageRef = doc(this.firestore, "channels", this.choosenChatId, "messages", this.selectionService.choosenMessageId.value);

      const originalMessageSnapshot = await getDoc(messageRef);
      const originalMessageContent = originalMessageSnapshot.data()?.['text'];
      const updatedMessageContent = this.assembleMessageContent(this.editingMessageText, originalMessageContent);

      await updateDoc(messageRef, {
        text: updatedMessageContent
      })
      this.cancelEditing();
    }
  }

  onHover(): void {
    this.isHovered = true;
  }

  onLeave(): void {
    this.isHovered = false;
  }

  openMemberView(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleMemberView();
    this.selectionService.selectedMemberId.next(this.messageUser.id);
    this.DMService.selectedProfileName = this.messageUser.name;
    this.DMService.selectedProfileImage = this.messageUser.image;
    this.DMService.selectedUserName = this.messageUser.name;
    this.DMService.selectedUserImage = this.messageUser.image;
  }

  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
  }

  showEditEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEditEmojiPicker = true;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, "channels", this.choosenChatId, "messages", this.choosenMessageId);

    getDoc(docRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        let reactions = data['reactions'] || {};

        if (reactions[emoji]) {
          const userIndex = reactions[emoji].users.indexOf(this.currentUserId);
          if (userIndex > -1) {
            reactions[emoji].count -= 1;
            reactions[emoji].users.splice(userIndex, 1);

            if (reactions[emoji].count === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].count += 1;
            reactions[emoji].users.push(this.currentUserId);
          }
        } else {
          reactions[emoji] = { count: 1, users: [this.currentUserId] };
        }
        updateDoc(docRef, { reactions });
        this.viewEmojiPicker = false;
      }
    });
  }

  addEditedEmoji(event: any) {
    this.editingMessageText += event.emoji.native;
  }

  isObjectWithCount(value: any): value is { count: number } {
    return typeof value === 'object' && value !== null && 'count' in value;
  }

  ngOnDestroy() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.unsubscribeMessageToAnswer) {
      this.unsubscribeMessageToAnswer();
    }
    this.selectionIdSubscription.unsubscribe();
    if (this.unsubscribeChannelMessages) {
      this.unsubscribeChannelMessages();
    }
  }

}
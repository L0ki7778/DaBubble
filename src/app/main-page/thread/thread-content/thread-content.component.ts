import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { ChatAnswerComponent } from './chat-answer/chat-answer.component';
import { Firestore, collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { SelectionService } from '../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { OverlayService } from '../../../services/overlay.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ReactionBarComponent } from '../../chat-container/chat-content/chat-message/reaction-bar/reaction-bar.component';

@Component({
  selector: 'app-thread-content',
  standalone: true,
  imports: [ChatAnswerComponent, CommonModule, PickerComponent, ReactionBarComponent],
  templateUrl: './thread-content.component.html',
  styleUrl: './thread-content.component.scss'
})
export class ThreadContentComponent {

  @Input() answer: any;
  @Output() editingStarted = new EventEmitter<{ messageId: string, messageText: string }>();

  edit: ElementRef | null = null;
  emoji: ElementRef | null = null;

  viewEmojiPicker: boolean = false;
  firestore = inject(Firestore);
  selectionService = inject(SelectionService);
  DMService = inject(DirectMessagesService);
  overlay = inject(OverlayService);

  message: any;
  messageUser: any = {};
  currentUserId: string = '';
  answers: any[] = [];
  viewOption: boolean = false;
  isHovered: boolean = false;


  selectionMessageIdSubscription?: Subscription;
  unsubscribeMessageAnswers: (() => void) | undefined;
  unsubscribeMessageToAnswer: (() => void) | undefined;
  choosenChatId: string = '';
  choosenMessageId: string = '';
  isOwnAnswer: boolean = false;

  constructor() {
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
        } else {
          console.log('No such document!');
        }
      });
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
          const postDate = new Date(messageSnapshot.data()['postTime']);
          const hours = postDate.getHours().toString().padStart(2, '0');
          const minutes = postDate.getMinutes().toString().padStart(2, '0');
          const formattedPostTime = `${hours}:${minutes}`;
          const formattedPostDate = postDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

          this.message = {
            text: messageSnapshot.data()['text'],
            posthour: formattedPostTime,
            postDay: formattedPostDate,
            reactions: messageSnapshot.data()['reactions'],
            authorId: messageSnapshot.data()['authorId'],
            docId: messageSnapshot.data()['docId']
          }
          messageSnapshot.data();
          this.getCurrentUserId();
          this.loadMessageUser();
        }
      });
    } else {
      return
    }
  }


  subscribeMessageAnswerChanges() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.choosenMessageId && this.choosenMessageId !== '') {
      const messageDocRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages', this.choosenMessageId, 'answers');
      const q = query(messageDocRef, orderBy('postTime'));
      this.unsubscribeMessageAnswers = onSnapshot(q, { includeMetadataChanges: true }, (answersSnapshot) => {
        this.answers = [];
        answersSnapshot.docs.forEach((answer: any) => {
          const postDate = new Date(answer.data()['postTime']);
          const hours = postDate.getHours().toString().padStart(2, '0');
          const minutes = postDate.getMinutes().toString().padStart(2, '0');
          const formattedPostTime = `${hours}:${minutes}`;

          const formattedPostDate = postDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

          this.answers.push({
            text: answer.data()['text'],
            posthour: formattedPostTime,
            postDay: formattedPostDate,
            reactions: answer.data()['reactions'],
            authorId: answer.data()['authorId'],
            docId: answer.data()['docId']
          });
        });
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

  startEditing() {
    if (this.message) {
      this.editingStarted.emit({ messageId: this.message.docId, messageText: this.message.text });
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
    this.selectionService.selectedMemberId = this.messageUser.id;
    this.DMService.selectedProfileName = this.messageUser.name;
    this.DMService.selectedProfileImage = this.messageUser.image;
    this.DMService.selectedUserName = this.messageUser.name;
    this.DMService.selectedUserImage = this.messageUser.image;
  }

  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
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
  }

}

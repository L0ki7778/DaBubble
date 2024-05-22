import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { BooleanValueService } from '../../../../services/boolean-value.service';
import { Firestore, collection, doc, getDoc, onSnapshot, query, updateDoc } from '@angular/fire/firestore';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';
import { SelectionService } from '../../../../services/selection.service';
import { DirectMessagesService } from '../../../../services/direct-messages.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent, PickerComponent, FormsModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  firestore: Firestore = inject(Firestore);
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  selectionService: SelectionService = inject(SelectionService);
  DMService: DirectMessagesService = inject(DirectMessagesService);

  @Input() message: any;
  @Input() messageId: string | null = null;
  @Input() messageText: string = '';
  @ViewChild('emoji') emoji: ElementRef | null = null;
  editMessage: boolean = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  selectionIdSubscription: Subscription;
  unsubscribeMessageAnswers: (() => void) | undefined;
  unsubscribeUsers: (() => void) | undefined;
  isOwnMessage: boolean = false;
  answersExist: boolean = false;
  isHovered: boolean = false;
  viewEmojiPicker: boolean = false;
  viewEditEmojiPicker: boolean = false;
  user: {
    name: string;
    image: string;
    id: string;
  } = {
      name: '',
      image: '',
      id: '',
    };
  answers: any[] = [];
  choosenChatId: string = '';
  currentUserId: string | null = null;
  currentMessageId: string = '';
  lastAnswerTime: string = '';
  imageTag: boolean = false;
  messageFromDeletedUser: boolean = false;


  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
    });
    this.getCurrentUserId();
  }

  ngOnInit() {
    if (this.message && this.message.authorId) {
      const docRef = doc(this.firestore, 'users', this.message.authorId);

      this.unsubscribeUsers = onSnapshot((docRef), (doc: any) => {
        if (doc.exists()) {
          this.user = {
            name: doc.data()['name'],
            image: doc.data()['image'],
            id: doc.id
          };
        } else {
          this.user = {
            name: 'Gelöschter User',
            image: 'assets/img/start-page/unknown.svg',
            id: ''
          };
          this.messageFromDeletedUser = true;
        }
      });
      this.currentMessageId = this.message['docId'];
      this.subscribeMessageAnswerChanges();
    }
  }

  subscribeMessageAnswerChanges() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    else if (this.currentMessageId && this.currentMessageId !== '') {
      const messageDocRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages', this.currentMessageId, 'answers');
      const q = query(messageDocRef);
      this.unsubscribeMessageAnswers = onSnapshot(q, { includeMetadataChanges: true }, (answersSnapshot: any) => {
        this.answers = [];
        answersSnapshot.docs.forEach((answer: any) => {
          this.answers.push(answer.data());
          this.checkIfAnswersExist();
          this.extractHoursAndMinutesFromUnixTime(this.answers[0].postTime)
        });
      });
    } else {
      return
    }
  }

  checkIfAnswersExist() {
    if (this.answers.length !== 0) {
      this.answersExist = true;
    }
    else {
      this.answersExist = false;
    }
  }

  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
    if (this.currentUserId === this.message.authorId) {
      this.isOwnMessage = true;
    }
    else {
      this.isOwnMessage = false
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
    this.selectionService.selectedMemberId.next(this.user.id);
    this.DMService.selectedProfileName = this.user.name;
    this.DMService.selectedProfileImage = this.user.image;
    this.DMService.selectedUserName = this.user.name;
    this.DMService.selectedUserImage = this.user.image;
  }

  showThread() {
    this.booleanService.toggleViewThread(true);
    this.selectionService.choosenMessageId.next(this.currentMessageId);
  }

  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
  }

  showEditEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEditEmojiPicker = true;
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.emoji && this.emoji.nativeElement && this.emoji.nativeElement.contains(event.target)) {
      return
    } else {
      this.viewEmojiPicker = false;
      this.viewEditEmojiPicker = false;
    }
  }

  addEditedEmoji(event: any) {
    this.editingMessageText += event.emoji.native;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, 'channels', this.choosenChatId, 'messages', this.message.docId);

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
      }
    });
  }

  getTimeDifferences(unixTimeMs: number) {
    const now = new Date();
    const date = new Date(unixTimeMs);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    const diffInWeeks = diffInDays / 7;
    const diffInMonths = diffInDays / 30;
    const diffInYears = diffInDays / 365;

    return { date, diffInHours, diffInDays, diffInWeeks, diffInMonths, diffInYears };
  }

  formatDateTime(date: Date, diffInHours: number, diffInDays: number, diffInWeeks: number, diffInMonths: number, diffInYears: number) {
    let formattedDateTime = '';
    if (diffInHours < 24) {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      formattedDateTime = date.toLocaleString('de-DE', options) + ' Uhr';
    } else {
      const diff = [
        { value: diffInYears, singular: 'Jahr', plural: 'Jahren' },
        { value: diffInMonths, singular: 'Monat', plural: 'Monaten' },
        { value: diffInWeeks, singular: 'Woche', plural: 'Wochen' },
        { value: diffInDays, singular: 'Tag', plural: 'Tagen' }
      ].find(d => d.value >= 1) || { value: 0, singular: '', plural: '' };

      formattedDateTime = `vor ${Math.round(diff.value) > 1 ? Math.round(diff.value) + ' ' + diff.plural : '1 ' + diff.singular}`;
    }

    return formattedDateTime;
  }

  extractHoursAndMinutesFromUnixTime(unixTimeMs: number) {
    const { date, diffInHours, diffInDays, diffInWeeks, diffInMonths, diffInYears } = this.getTimeDifferences(unixTimeMs);
    this.lastAnswerTime = this.formatDateTime(date, diffInHours, diffInDays, diffInWeeks, diffInMonths, diffInYears);
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
    if (this.choosenChatId && this.currentMessageId) {
      const messageRef = doc(this.firestore, "channels", this.choosenChatId, "messages", this.currentMessageId);

      const originalMessageSnapshot = await getDoc(messageRef);
      const originalMessageContent = originalMessageSnapshot.data()?.['text'];
      const updatedMessageContent = this.assembleMessageContent(this.editingMessageText, originalMessageContent);

      await updateDoc(messageRef, {
        text: updatedMessageContent
      })
    }
  }

  isObjectWithCount(value: any): value is { count: number } {
    return typeof value === 'object' && value !== null && 'count' in value;
  }

  ngOnDestroy() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
    }
  }

}
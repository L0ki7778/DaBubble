import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { BooleanValueService } from '../../../../services/boolean-value.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Subscription } from 'rxjs';
import { SelectionService } from '../../../../services/selection.service';
import { DirectMessagesService } from '../../../../services/direct-messages.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-answer',
  standalone: true,
  imports: [CommonModule, PickerComponent, FormsModule],
  templateUrl: './chat-answer.component.html',
  styleUrl: './chat-answer.component.scss'
})

export class ChatAnswerComponent {

  firestore: Firestore = inject(Firestore);
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  selectionService: SelectionService = inject(SelectionService);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  isHovered: boolean = false;
  viewOption: boolean = false;
  viewEmojiPicker: boolean = false;
  user: any = {};
  choosenChatId: string = '';
  currentUserId: string | null = null;
  @Input() isOwnAnswer: boolean = false;
  @Input() answer: any;
  @ViewChild('emoji') emoji: ElementRef | null = null;
  selectionIdSubscription: Subscription;
  editAnswer: boolean = false;
  editingAnswerId: string | null = null;
  editingAnswerText: string = '';


  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
    });
    this.getCurrentUserId();
  }

  ngOnInit() {
    if (this.answer && this.answer.authorId) {
      const docRef = doc(this.firestore, 'users', this.answer.authorId);

      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          this.user = {
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

  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
    if (this.currentUserId === this.answer.authorId) {
      this.isOwnAnswer = true;
    }
    else {
      this.isOwnAnswer = false
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
    this.selectionService.selectedMemberId = this.user.id;
    this.DMService.selectedProfileName = this.user.name;
    this.DMService.selectedProfileImage = this.user.image;
    this.DMService.selectedUserName = this.user.name;
    this.DMService.selectedUserImage = this.user.image;
  }

  showOption(event: MouseEvent) {
    event.stopPropagation();
    this.viewOption = true;
  }

  startEditing(answerId: string, answerText: string) {
    this.editAnswer = true;
    this.editingAnswerId = answerId;
    this.editingAnswerText = this.extractTextFromAnswerContent(answerText);
    this.viewOption = false;
  }

  cancelEditing() {
    this.editingAnswerId = null;
    this.editingAnswerText = '';
    this.editAnswer = false;
  }

  extractTextFromAnswerContent(answerContent: string): string {
    const textContainer = answerContent.match(/<div class="text-container">(.*?)<\/div>/s);
    return textContainer ? textContainer[1].trim() : answerContent;
  }

  assembleAnswerContent(answerText: string, originalAnswerContent: string): string {
    const answerImage = originalAnswerContent.match(/<div class="image-box">.*?<\/div>/s)?.[0] || '';
    const textContainer = `<div class="text-container">${answerText}</div>`;
    return `<div class="message-wrapper">${answerImage}${textContainer}</div>`;
  }

  async saveEditedAnswer() {
    if (this.choosenChatId && this.selectionService.choosenMessageId.value && this.answer.docId) {
      const answerRef = doc(this.firestore, "channels", this.choosenChatId, "messages", this.selectionService.choosenMessageId.value, "answers", this.answer.docId);

      const originalMessageSnapshot = await getDoc(answerRef);
      const originalMessageContent = originalMessageSnapshot.data()?.['text'];
      const updatedMessageContent = this.assembleAnswerContent(this.editingAnswerText, originalMessageContent);

      await updateDoc(answerRef, {
        text: updatedMessageContent
      })
      
      this.cancelEditing();
    }
  }

  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.emoji && this.emoji.nativeElement && this.emoji.nativeElement.contains(event.target)) {
      return
    } else {
      this.viewEmojiPicker = false;
    }
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, "channels", this.choosenChatId, "messages", this.selectionService.choosenMessageId.value, "answers", this.answer.docId);

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

  isObjectWithCount(value: any): value is { count: number } {
    return typeof value === 'object' && value !== null && 'count' in value;
  }

}
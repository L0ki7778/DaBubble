import { CommonModule, formatDate } from '@angular/common';
import { Component, Input, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageType } from '../../../types/private-message.type';
import { ReactionBarComponent } from '../chat-content/chat-message/reaction-bar/reaction-bar.component';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-private-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent, FormsModule, PickerComponent],
  templateUrl: './private-message.component.html',
  styleUrl: './private-message.component.scss'
})

export class PrivateMessageComponent {
  overlay = inject(OverlayService);
  currentUserId: string | null = null;
  DMService: DirectMessagesService = inject(DirectMessagesService);
  booleanService = inject(BooleanValueService);
  messageTime: any = null;
  @Input() message: any;
  @Input() messageId: string | null = null;
  @Input() messageText: string = '';
  editMessage: boolean = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  viewEmojiPicker: boolean = false;
  @ViewChild('emojiPicker') emoji: ElementRef<HTMLElement>| any;

  isHovered: boolean = false;

  constructor() {
    this.getCurrentUserId();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isClickInsideEmojiPicker(event)) {
      return;
    }
    this.viewEmojiPicker = false;
  }

  isClickInsideEmojiPicker(event: MouseEvent): boolean {
    const emojiPicker = this.emoji?.nativeElement;
    const target = event.target as HTMLElement;
    return emojiPicker && emojiPicker.contains(target);
  }


  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
  }

  isOwnMessage(message: PrivateMessageType): boolean {
    return this.currentUserId !== null && message.authorId === this.currentUserId;
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
  }


  showThread() {
    this.booleanService.viewThread.set(true);
  }

  startEditing(messageId: string, messageText: string) {
    this.editMessage = true;
    this.editingMessageId = messageId;
    this.editingMessageText = messageText;
  }

  cancelEditing() {
    this.editingMessageId = null;
    this.editingMessageText = '';
    this.editMessage = false;
  }

  async saveEditedMessage(messageId: string | undefined) {
    try {
      const existingChatWithBothUsers = await this.DMService.retrieveChatDocumentReference();
      if (existingChatWithBothUsers) {
        const messagesCollectionRef = collection(existingChatWithBothUsers.ref, 'chat-messages');
        const messageDocRef = doc(messagesCollectionRef, messageId);
        await updateDoc(messageDocRef, { text: this.editingMessageText });
        console.log('Message updated successfully');
        this.editingMessageId = null;
        this.editingMessageText = '';
        await this.DMService.loadChatHistory();
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
  }

  addEmoji(event: any) {
    this.editingMessageText += event.emoji.native;
  }
}
import { CommonModule, formatDate } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageType } from '../../../types/private-message.type';
import { ReactionBarComponent } from '../chat-content/chat-message/reaction-bar/reaction-bar.component';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-private-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent, FormsModule],
  templateUrl: './private-message.component.html',
  styleUrl: './private-message.component.scss'
})

export class PrivateMessageComponent {
  overlay = inject(OverlayService);
  currentUserId: string | null = null;
  DMService: DirectMessagesService = inject(DirectMessagesService);
  booleanService = inject(BooleanValueService);
  messageText: any = null;
  messageTime: any = null;
  @Input() message: any;
  editMessage: boolean = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';

  isHovered: boolean = false;

  constructor() {
    this.getCurrentUserId();
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
  }
  
  async saveEditedMessage(messageId: string | undefined) {
    if (!messageId) {
      console.error('Message ID is undefined');
      return;
    }
  
    try {
      const existingChatWithBothUsers = await this.DMService.retrieveChatDocumentReference();
      if (existingChatWithBothUsers) {
        const messagesCollectionRef = collection(existingChatWithBothUsers.ref, 'chat-messages');
        const messageDocRef = doc(messagesCollectionRef, messageId);
        await updateDoc(messageDocRef, { text: this.editingMessageText });
        console.log('Message updated successfully');
        this.editingMessageId = null;
        this.editingMessageText = '';
        await this.DMService.loadChatHistory(); // Aktualisieren Sie die Chatnachrichten nach dem Speichern
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }
}

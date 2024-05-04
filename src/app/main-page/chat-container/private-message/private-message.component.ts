import { CommonModule } from '@angular/common';
import { Component, Input, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageType } from '../../../types/private-message.type';
import { ReactionBarComponent } from '../chat-content/chat-message/reaction-bar/reaction-bar.component';
import { DocumentSnapshot, collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-private-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent, FormsModule, PickerComponent],
  templateUrl: './private-message.component.html',
  styleUrl: './private-message.component.scss'
})

export class PrivateMessageComponent {
  firestore: Firestore = inject(Firestore);
  overlay = inject(OverlayService);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  booleanService = inject(BooleanValueService);
  @Input() message: any;
  @Input() messageId: string | null = null;
  @Input() messageText: string = '';
  @ViewChild('emojiPicker') emoji: ElementRef<HTMLElement> | any;
  currentUserId: string | null = null;
  messageTime: any = null;
  editMessage: boolean = false;
  editingMessageId: string | null = null;
  editingMessageText: string = '';
  viewEmojiPickerEdit: boolean = false;
  viewEmojiPickerReaction: boolean = false;
  isHovered: boolean = false;
  unsubscribe: any;
  imageTag: boolean = false;


  constructor() {
    this.getCurrentUserId();
  }

  ngOnInit() {
    this.checkForImageTag();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isClickInsideEmojiPicker(event)) {
      return;
    }
    this.viewEmojiPickerEdit = false;
    this.viewEmojiPickerReaction = false;
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
    this.DMService.selectedProfileName = this.message.authorName;
    this.DMService.selectedProfileImage = this.message.authorImage;
  }

  showThread() {
    this.booleanService.toggleViewThread(true);
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

  async saveEditedMessage(messageId: string | undefined) {
    try {
      const existingChatWithBothUsers = await this.DMService.retrieveChatDocumentReference();
      if (existingChatWithBothUsers) {
        const messagesCollectionRef = collection(existingChatWithBothUsers.ref, 'chat-messages');
        const messageDocRef = doc(messagesCollectionRef, messageId);
        const originalMessageSnapshot = await getDoc(messageDocRef);
        const originalMessageContent = originalMessageSnapshot.data()?.['text'];
        const updatedMessageContent = this.assembleMessageContent(this.editingMessageText, originalMessageContent);
        await updateDoc(messageDocRef, { text: updatedMessageContent });
        this.editingMessageId = null;
        this.editingMessageText = '';
        await this.DMService.loadChatHistory();
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  showEmojiPickerEdit(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPickerEdit = true;
  }

  showEmojiPickerReaction(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPickerReaction = true;
  }

  addEmoji(event: any) {
    this.editingMessageText += event.emoji.native;
  }

  isObjectWithCount(value: any): value is { count: number } {
    return typeof value === 'object' && value !== null && 'count' in value;
  }

  async getExistingChat() {
    return await this.DMService.retrieveChatDocumentReference();
  }

  async getMessageSnapshot(existingChatWithBothUsers: any, messageId: string) {
    const messagesCollectionRef = collection(existingChatWithBothUsers.ref, 'chat-messages');
    const messageDocRef = doc(messagesCollectionRef, messageId);
    return { messageSnapshot: await getDoc(messageDocRef), messageDocRef };
  }

  async updateReactions(emoji: string, reactions: any, messageDocRef: any) {
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

    await updateDoc(messageDocRef, { reactions });
  }

  async subscribeToMessageUpdates(messageDocRef: any) {
    this.unsubscribe = onSnapshot(messageDocRef, (docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        this.message.reactions = data['reactions'];
      }
    });
  }

  async addReaction(event: any) {
    const emoji = event.emoji.native;
    const messageId = this.message.id;

    try {
      const existingChatWithBothUsers = await this.getExistingChat();
      if (existingChatWithBothUsers) {
        const { messageSnapshot, messageDocRef } = await this.getMessageSnapshot(existingChatWithBothUsers, messageId);
        if (messageSnapshot.exists()) {
          const data = messageSnapshot.data();
          let reactions = data['reactions'] || {};

          await this.updateReactions(emoji, reactions, messageDocRef);
          await this.subscribeToMessageUpdates(messageDocRef);

          this.viewEmojiPickerReaction = false;
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  checkForImageTag() {
    if (this.message.text.includes('<img')) {
      this.imageTag = true;
    }
  }

}
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore, addDoc, collection, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { OverlayService } from '../../../services/overlay.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PickerComponent
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  overlayService = inject(OverlayService);
  channelSubscription: Subscription;

  @ViewChild('emoji') emoji: ElementRef | null = null;
  @ViewChild('textarea') textarea: ElementRef | any;

  chatContent: string = '';
  viewEmojiPicker: boolean = false;
  selectedFile: string | ArrayBuffer | null = null;
  selectedFileName: string | null = null;
  isUploading: boolean = false;
  currentChannelName: string = '';

  constructor() {
    this.channelSubscription = this.selectionService.choosenChatTypeId$.subscribe(newChannel => {
      const currentChannelId = newChannel;
      this.currentChannelName = this.selectionService.getChannelNameById(currentChannelId);
    });
  }

  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }


  async onFileSelected(event: any) {
    const selectedEventFile = event.target.files[0];
    if (selectedEventFile) {
      if (selectedEventFile.size > 1024 * 1024) {
        this.overlayService.toggleWarning();
        event.target.value = '';
        return;
      }

      this.selectedFile = await this.fileToBase64(selectedEventFile);
      this.selectedFileName = selectedEventFile.name;
    }
    event.target.value = '';
  }



  deselectFile() {
    this.selectedFile = null;
    this.selectedFileName = null;
  }


  async onSubmit(chatContent: string) {
    const trimmedChatContent = chatContent.trim();
    if ((!trimmedChatContent && !this.selectedFile) || this.isUploading) {
      return;
    }
    this.isUploading = true;

    /* Upload for channel messages */

    if (this.selectionService.channelOrDM.value === 'channel') {
      const currentUser = await this.DMService.getLoggedInUserId();
      const currentChannel = this.selectionService.choosenChatTypeId.value;
      const messageText = this.chatContent;
      const messageImage = this.selectedFile ? `<div class="image-box"><img src="${this.selectedFile}"></div>` : '';
      const messageContent = `<div class="message-wrapper">${messageImage}<div class="text-container">${messageText}</div></div>`;
      const newDoc: any = await addDoc(collection(this.firestore, "channels", currentChannel, "messages"), {
        authorId: currentUser,
        postTime: new Date().getTime(),
        text: messageContent
      });
      const newDocId = newDoc.id;
      await updateDoc(newDoc, { docId: newDocId });
      this.chatContent = '';
      this.deselectFile();
    }

    /* Upload for direct messages */

    else if (this.selectionService.channelOrDM.value === 'direct-message') {
      const otherUserId = await this.DMService.getUserId(this.DMService.selectedUserName);
      if (otherUserId) {
        const messageText = this.chatContent;
        const messageImage = this.selectedFile ? `<div class="image-box"><img src="${this.selectedFile}"></div>` : '';
        const messageContent = `<div class="message-wrapper">${messageImage}<div class="text-container">${messageText}</div></div>`;
        await this.DMService.addUserToDirectMessagesWithIds(otherUserId, messageContent);
        await this.DMService.loadChatHistory();
        this.chatContent = '';
        this.deselectFile();
      } else {
        console.error('Error getting user ID');
      }
    }

    this.isUploading = false;
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
    this.chatContent += event.emoji.native;
  }

  chatContentChanged(newValue: string) {
    this.chatContent = newValue;
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

}
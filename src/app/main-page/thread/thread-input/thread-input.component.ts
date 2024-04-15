import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { Firestore, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { OverlayService } from '../../../services/overlay.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserMentionComponent } from '../../chat-container/chat-input/user-mention/user-mention.component';

@Component({
  selector: 'app-thread-input',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PickerComponent,
    UserMentionComponent],
  templateUrl: './thread-input.component.html',
  styleUrl: './thread-input.component.scss'
})
export class ThreadInputComponent {

  booleanService = inject(BooleanValueService);
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  overlayService = inject(OverlayService);
  channelSubscription: Subscription;

  @ViewChild('emoji') emoji: ElementRef | null = null;
  @ViewChild('textarea') textarea: ElementRef | any;

  chatContent: string = '';
  viewEmojiPicker: boolean = false;
  userMentionView: boolean = false;
  selectedFile: string | ArrayBuffer | null = null;
  selectedFileName: string | null = null;
  isUploading: boolean = false;
  currentChannelName: string = '';
  mentionedUser: string = '';
  previousValue: string = '';
  searchTerm: string = '';
  atSignActive: boolean = false;
  userMention = this.booleanService.userMention;

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
    this.viewEmojiPicker = !this.viewEmojiPicker;
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.emoji && this.emoji.nativeElement && this.emoji.nativeElement.contains(event.target)) {
      return;
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

  showUserMention(event: MouseEvent) {
    event.stopPropagation();
    let currentValue = this.booleanService.userMention();
    this.booleanService.userMention.set(currentValue ? false : true);
  }


  handleUserMentioned(name: string) {
    let lastAt = this.chatContent.lastIndexOf('@');
    if (lastAt != -1) {
      this.chatContent = this.chatContent.substring(0, lastAt) + '@' + name + ' ';
    } else {
      this.chatContent += '@' + name + ' ';
    }
  }



  checkForAtSign(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    if (event.key === '@' && (this.previousValue === '' || this.previousValue.endsWith(' '))) {
      this.searchTerm = '';
      this.booleanService.userMention.set(true);
      this.atSignActive = true;
    } else if (this.atSignActive) {
      if (event.key === ' ' || (event.key === 'Backspace' && this.previousValue.endsWith('@'))) {
        this.booleanService.userMention.set(false);
        this.atSignActive = false;
      } else {
        this.searchTerm = input.value.slice(input.value.lastIndexOf('@') + 1);
      }
    }
    this.previousValue = input.value;
  }
}

import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { OverlayService } from '../../../services/overlay.service';
import { Subscription } from 'rxjs';
import { UserMentionComponent } from './user-mention/user-mention.component';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PickerComponent,
    UserMentionComponent
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
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
  selectedFile: any = null;
  selectedFileName: string | null = null;
  selectedFileUrl: string | null = null;
  isUploading: boolean = false;
  currentChannelName: string = '';
  mentionedUser: string = '';
  previousValue: string = '';
  searchUser: string = '';
  searchChannel: string = '';
  atSignActive: boolean = false;
  hashSignActive: boolean = false;
  viewUser: boolean = true;
  viewChannel: boolean = true;
  userMention = this.booleanService.userMention;
  originalFile: File | null = null;


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
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      this.selectedFile = await this.fileToBase64(selectedFile);
      this.selectedFileName = selectedFile.name;
      this.originalFile = selectedFile;
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
    const { messageImage, uploadedFileUrl } = await this.uploadFile(this.selectedFile);
    if (this.selectionService.channelOrDM.value === 'channel') {
      await this.handleChannelMessage(trimmedChatContent, messageImage, uploadedFileUrl);
    } else if (this.selectionService.channelOrDM.value === 'direct-message') {
      await this.handleDirectMessage(trimmedChatContent, messageImage, uploadedFileUrl);
    }
    this.isUploading = false;
  }

  async uploadFile(selectedFile?: string) {
    let messageImage = '';
    let uploadedFileUrl = '';
    if (selectedFile) {
      const file = this.dataURIToBlob(selectedFile.toString());
      const filePath = `uploads/${this.originalFile?.name}`;
      const storage = getStorage();
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      uploadedFileUrl = await getDownloadURL(storageRef);
      messageImage = `<div class="image-box"><img src="${uploadedFileUrl}"></div>`;
    }
    return { messageImage, uploadedFileUrl };
  }

  async handleChannelMessage(trimmedChatContent: string, messageImage: string, uploadedFileUrl: string) {
    const currentUser = await this.DMService.getLoggedInUserId();
    const currentChannel = this.selectionService.choosenChatTypeId.value;
    const messageText = this.styleAtMentions(trimmedChatContent.replace(/\n/g, '<br>'));
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

  styleAtMentions(text: string): string {
    let styledText = text.replace(/(@[\wüäöß]+\s[\wüäöß]+)/g, '<span class="mention">$1</span>');
    styledText = styledText.replace(/(#[\wüäöß]+)/g, '<span class="mention">$1</span>');
    return styledText;
  }


  async handleDirectMessage(trimmedChatContent: string, messageImage: string, uploadedFileUrl: string) {
    const otherUserId = await this.DMService.getUserId(this.DMService.selectedUserName);
    if (otherUserId) {
      const messageText = trimmedChatContent.replace(/\n/g, '<br>');
      const messageContent = `<div class="message-wrapper">${messageImage}<div class="text-container">${messageText}</div></div>`;
      await this.DMService.addUserToDirectMessagesWithIds(otherUserId, messageContent);
      await this.DMService.loadChatHistory();
      this.chatContent = '';
      this.deselectFile();
    } else {
      console.error('Error getting user ID');
    }
  }

  dataURIToBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
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
    this.selectedFileUrl = null;
  }

  showUserMention(event: MouseEvent) {
    event.stopPropagation();
    this.searchUser = '';
    this.searchChannel = '';
    this.viewUser = true;
    this.viewChannel = true;
    let currentValue = this.booleanService.userMention();
    this.booleanService.userMention.set(currentValue ? false : true);
  }

  handleUserMentioned(name: string) {
    let lastAt = this.chatContent.lastIndexOf('@');
    let lastHash = this.chatContent.lastIndexOf('#');
    let spaceExists = name.includes(' ');

    if (spaceExists) {
      if (lastAt != -1) {
        this.chatContent = this.chatContent.substring(0, lastAt) + '@' + name + ' ';
      } else {
        this.chatContent += '@' + name + ' ';
      }
    } else {
      if (lastHash != -1) {
        this.chatContent = this.chatContent.substring(0, lastHash) + '#' + name + ' ';
      } else {
        this.chatContent += '#' + name + ' ';
      }
    }
  }



  checkForSpecialSign(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const isAtSign = (event.key === '@') ||
      (event.code === 'KeyQ' && event.altKey) ||
      (event.code === 'Digit2' && event.shiftKey) ||
      (event.code === 'KeyL' && event.altKey);
    const isHashSign = (event.key === '#') ||
      (event.code === 'Digit3' && event.shiftKey);

    if (isAtSign && (this.previousValue === '' || this.previousValue.endsWith(' '))) {
      this.searchUser = '';
      this.booleanService.userMention.set(true);
      this.atSignActive = true;
      this.viewChannel = false;
      this.viewUser = true;
    } else if (isHashSign && (this.previousValue === '' || this.previousValue.endsWith(' '))) {
      this.searchChannel = '';
      this.booleanService.userMention.set(true);
      this.hashSignActive = true;
      this.viewUser = false;
      this.viewChannel = true;
    } else if (this.atSignActive || this.hashSignActive) {
      if (event.key === ' ') {
        this.booleanService.userMention.set(false);
        this.atSignActive = false;
        this.hashSignActive = false;
        this.viewUser = true;
        this.viewChannel = true;
      } else if (this.atSignActive) {
        this.searchUser = input.value.slice(input.value.lastIndexOf('@') + 1);
      } else if (this.hashSignActive) {
        this.searchChannel = input.value.slice(input.value.lastIndexOf('#') + 1);
      }
    }
    this.previousValue = input.value;
  }

  checkForBackspace(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const atSignCount = (this.previousValue.match(/@/g) || []).length;
    const newAtSignCount = (input.value.match(/@/g) || []).length;
    const hashSignCount = (this.previousValue.match(/#/g) || []).length;
    const newHashSignCount = (input.value.match(/#/g) || []).length;

    if (event.key === 'Backspace') {
      if (atSignCount > newAtSignCount && this.previousValue.endsWith('@')) {
        this.booleanService.userMention.set(false);
        this.atSignActive = false;
      } else if (hashSignCount > newHashSignCount && this.previousValue.endsWith('#')) {
        this.booleanService.userMention.set(false);
        this.hashSignActive = false;
      }
    }
    this.previousValue = input.value;
  }

}
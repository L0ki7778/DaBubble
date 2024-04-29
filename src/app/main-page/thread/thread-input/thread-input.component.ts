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
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

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
  answerContent: string = '';
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

  async uploadFile(file: File): Promise<string> {
    const filePath = `uploads/${file.name}`;
    const storage = getStorage();
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
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

  async uploadImage() {
    if (!this.selectedFile) {
      return '';
    }
    const file = this.dataURIToBlob(this.selectedFile.toString());
    const filePath = `uploads/${this.originalFile?.name}`;
    const storage = getStorage();
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const uploadedFileUrl = await getDownloadURL(storageRef);
    return `<div class="image-box"><img src="${uploadedFileUrl}"></div>`;
  }

  async addAnswer(messageContent: string) {
    const currentUser = await this.DMService.getLoggedInUserId();
    const currentChannel = this.selectionService.choosenChatTypeId.value;
    const currentMessage = this.selectionService.choosenMessageId.value;
    const newDoc: any = await addDoc(collection(this.firestore, "channels", currentChannel, "messages", currentMessage, "answers"), {
      authorId: currentUser,
      postTime: new Date().getTime(),
      text: messageContent
    });
    const newDocId = newDoc.id;
    await updateDoc(newDoc, { docId: newDocId });
  }

  async onSubmit(answerContent: string) {
    const trimmedChatContent = answerContent.trim();
    if ((!trimmedChatContent && !this.selectedFile) || this.isUploading) {
      return;
    }
    this.isUploading = true;
    const messageImage = await this.uploadImage();
    const messageText = this.answerContent.replace(/\n/g, '<br>');
    const messageContent = `<div class="message-wrapper">${messageImage}<div class="text-container">${messageText}</div></div>`;
    await this.addAnswer(messageContent);
    this.answerContent = '';
    this.deselectFile();
    this.isUploading = false;
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
    this.answerContent += event.emoji.native;
    this.viewEmojiPicker = false;
  }

  answerContentChanged(newValue: string) {
    this.answerContent = newValue;
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

}
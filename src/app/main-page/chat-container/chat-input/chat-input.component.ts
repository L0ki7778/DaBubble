import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore, addDoc, collection, updateDoc } from '@angular/fire/firestore';

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

  @ViewChild('emoji') emoji: ElementRef | null = null;
  @ViewChild('textarea') textarea: ElementRef | any;

  chatContent: string = '';
  viewEmojiPicker: boolean = false;


  async onSubmit(chatContent: string) {
    if (this.selectionService.channelOrDM.value === 'channel') {
      const currentUser = await this.DMService.getLoggedInUserId();
      const currentChannel = this.selectionService.choosenChatTypeId.value;
      const newDoc: any = await addDoc(collection(this.firestore, "channels", currentChannel, "messages"), {
        authorId: currentUser,
        postTime: new Date().getTime(),
        reactions: [],
        text: this.chatContent,
      });
      const newDocId = newDoc.id;
      await updateDoc(newDoc, { docId: newDocId });
      this.chatContent = '';
    }
    if (this.selectionService.channelOrDM.value === 'direct-message') {
      const otherUserId = await this.DMService.getUserId(this.DMService.selectedUserName);
      if (otherUserId) {
        await this.DMService.addUserToDirectMessagesWithIds(otherUserId, chatContent);
        await this.DMService.loadChatHistory();
        this.chatContent = '';
      } else {
        console.error('Error getting user ID');
      }
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
    this.chatContent += event.emoji.native;
  }

  chatContentChanged(newValue: string) {
    this.chatContent = newValue;
  }
}

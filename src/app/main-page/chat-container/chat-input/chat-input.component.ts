import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    EditorModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent{

  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  characterCount = 0;
  maxCharacters = 300;
  characterSubscription?: Subscription;

  chatForm: FormGroup = new FormGroup({});
  chatContent: string = '';

  ngOnInit() {
    this.newMessage();
  };

  async onSubmit(chatContent: string) {
    if (this.selectionService.channelOrDM.value === 'channel') {
      console.log('send message to channel');
      // muss noch implementiert werden
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

  subscribeCharacters() {
    this.characterSubscription = this.chatForm.get('message')?.valueChanges.subscribe((value) => {
      this.characterCount = value.length;
    })
  };

  newMessage() {
    this.chatForm = new FormGroup({
      message: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]),
    });
    this.subscribeCharacters();
  };

  // onSubmit() {
  //   console.log(this.chatForm.value);
  //   this.characterSubscription?.unsubscribe()
  //   this.chatForm.reset();
  //   this.subscribeCharacters();
  // }
}

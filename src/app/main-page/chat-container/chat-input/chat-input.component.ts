import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent{
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);

  chatContent: string = '';

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
}

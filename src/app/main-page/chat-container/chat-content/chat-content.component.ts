import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { DirectMessagesService } from '../../../services/direct-messages.service';

@Component({
  selector: 'app-chat-content',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-content.component.html',
  styleUrl: './chat-content.component.scss'
})
export class ChatContentComponent {
  DMService: DirectMessagesService = inject(DirectMessagesService);
}

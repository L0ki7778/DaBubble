import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { ChatHeaderComponent } from './chat-header/chat-header.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, ChatHeaderComponent],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {
}

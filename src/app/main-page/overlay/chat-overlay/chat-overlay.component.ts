import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-overlay',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './chat-overlay.component.html',
  styleUrl: './chat-overlay.component.scss'
})
export class ChatOverlayComponent {

}

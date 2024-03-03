import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { ChatOverlayComponent } from '../../overlay/chat-overlay/chat-overlay.component';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, ChatOverlayComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  overlayService = inject(OverlayService);

  imgSrc: string = "../../../../assets/img/main-page/chat/add-members-button-hover.svg";

  btn(event: Event) {
    event.stopPropagation();
    console.log("btn clicked");
    this.overlayService.toggleChatOverlay();
    console.log(this.overlayService.chatOverlay)
  }

}

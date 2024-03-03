import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { ChatOverlayComponent } from '../../overlay/chat-overlay/chat-overlay.component';
import { AddMemberOverlayComponent } from '../../overlay/add-member-overlay/add-member-overlay.component';
import { MembersOverlayComponent } from '../../overlay/members-overlay/members-overlay.component';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, ChatOverlayComponent, MembersOverlayComponent, AddMemberOverlayComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  overlayService = inject(OverlayService);

  imgSrc: string = "../../../../assets/img/main-page/chat/add-members-button-hover.svg";

  openChatOverlay(event: Event) {
    event.stopPropagation();
    this.overlayService.toggleChatOverlay();
  }

  openMembersOverlay(event: Event) {
    event.stopPropagation();
    this.overlayService.toggleMembersOverlay();
  }

  openAddMemberOverlay(event: Event) {
    event.stopPropagation();
    this.overlayService.toggleAddMemberOverlay();
  }
}

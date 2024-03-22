import { CommonModule } from '@angular/common';
import { Component,inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageType } from '../../../types/private-message.type';
import { ReactionBarComponent } from '../chat-content/chat-message/reaction-bar/reaction-bar.component';

@Component({
  selector: 'app-private-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent],
  templateUrl: './private-message.component.html',
  styleUrl: './private-message.component.scss'
})
export class PrivateMessageComponent {
  overlay = inject(OverlayService);
  currentUserId: string | null = null;
  DMService: DirectMessagesService = inject(DirectMessagesService);

  booleanService = inject(BooleanValueService);
  privateMessage: any = null;
  messageText: any = null;
  messageTime: any = null;

  isHovered: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.getCurrentUserId();
  }

  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
  }

  isOwnMessage(message: PrivateMessageType): boolean {
    return message.authorId === this.currentUserId;
  }


  onHover(): void {
    this.isHovered = true;
  }

  onLeave(): void {
    this.isHovered = false;
  }

  openMemberView(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleMemberView();
  }


  showThread() {
    this.booleanService.viewThread.set(true);
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { BooleanValueService } from '../../../../services/boolean-value.service';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  overlay = inject(OverlayService);
  
@Input()isOwnMessage: boolean = true;
  booleanService = inject(BooleanValueService);
  
  isHovered: boolean = false;

  constructor() {
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

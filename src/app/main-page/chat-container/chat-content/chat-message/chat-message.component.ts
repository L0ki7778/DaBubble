import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { BooleanValueService } from '../../../../services/boolean-value.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  firestore: Firestore = inject(Firestore);
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  
  @Input() isOwnMessage: boolean = true;
  @Input() message: any;

  isHovered: boolean = false;
  formattedTime: string = '';
  

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

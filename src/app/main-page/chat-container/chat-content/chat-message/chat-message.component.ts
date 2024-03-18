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
  @Input() isOwnMessage: boolean = true;
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  firestore: Firestore = inject(Firestore);

  isHovered: boolean = false;


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

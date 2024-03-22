import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { BooleanValueService } from '../../../../services/boolean-value.service';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ReactionBarComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  firestore: Firestore = inject(Firestore);
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);

  @Input() isOwnMessage: boolean = true;
  @Input() message: any;

  isHovered: boolean = false;
  user: any = {};

  ngOnInit() {
    if (this.message && this.message.authorId) {
      const docRef = doc(this.firestore, 'users', this.message.authorId);

      getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          this.user = {
            name: doc.data()['name'],
            image: doc.data()['image'],
          };
        } else {
          console.log('No such document!');
        }
      });
    }
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

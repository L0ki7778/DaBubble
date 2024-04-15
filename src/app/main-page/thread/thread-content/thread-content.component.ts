import { Component, Input, inject } from '@angular/core';
import { ChatAnswerComponent } from './chat-answer/chat-answer.component';
import { Firestore, collection, onSnapshot, query } from '@angular/fire/firestore';
import { SelectionService } from '../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread-content',
  standalone: true,
  imports: [ChatAnswerComponent, CommonModule],
  templateUrl: './thread-content.component.html',
  styleUrl: './thread-content.component.scss'
})
export class ThreadContentComponent {

  @Input() answer: any;
  firestore = inject(Firestore);
  selectionService = inject(SelectionService);

  answers: any[] = [];

  selectionMessageIdSubscription?: Subscription;
  unsubscribeMessageAnswers: (() => void) | undefined;
  choosenChatId: string = '';
  choosenMessageId: string = '';

  constructor() {
    this.choosenChatId = this.selectionService.choosenChatTypeId.value;
    if (this.selectionService.channelOrDM.value === 'channel') {
      this.selectionMessageIdSubscription = this.selectionService.choosenMessageId.subscribe(newId => {
        this.choosenMessageId = newId;
        if (this.choosenMessageId !== '') {
          this.answers = [];
          this.subscribeMessageAnswerChanges();
        }
      });
    }
  }

  subscribeMessageAnswerChanges() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.choosenMessageId && this.choosenMessageId !== '') {
      const messageDocRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages', this.choosenMessageId, 'answers');
      const q = query(messageDocRef);
      this.unsubscribeMessageAnswers = onSnapshot(q, { includeMetadataChanges: true }, (answersSnapshot) => {
        answersSnapshot.docs.forEach((answer: any) => {
          this.answers.push(answer.data());
        });
      });
    } else {
      return
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
  }

}

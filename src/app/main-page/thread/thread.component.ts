import { Component, Input, inject } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { SelectionService } from '../../services/selection.service';
import { ChatAnswerComponent } from './chat-answer/chat-answer.component';
import { Subscription } from 'rxjs';
import { Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, ChatAnswerComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

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
        if (this.choosenMessageId != '') {
          this.subscribeMessageAnswerChanges();
        }
      });
    }
  }

  ngOnInit() {

  }

  subscribeMessageAnswerChanges() {
    this.answers = [];
    if (this.unsubscribeMessageAnswers) {
      this.unsubscribeMessageAnswers();
    }
    if (this.choosenMessageId && this.choosenMessageId !== '') {
      const messageDocRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages', this.choosenMessageId, 'answers');
      const q = query(messageDocRef);
      this.unsubscribeMessageAnswers = onSnapshot(q, { includeMetadataChanges: true }, (answersSnapshot) => {
        answersSnapshot.docs.forEach((answer: any) => {
          this.answers.push(answer);
          console.log(answer);
        });
      });
    } else {
      return
    }
  }

}

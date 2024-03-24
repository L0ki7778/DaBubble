import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { Firestore, collection, doc, getDocs, onSnapshot, orderBy, query } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { PrivateMessageComponent } from '../private-message/private-message.component';
import { SelectionService } from '../../../services/selection.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-chat-content',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, PrivateMessageComponent],
  templateUrl: './chat-content.component.html',
  styleUrl: './chat-content.component.scss'
})
export class ChatContentComponent {
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  private selectionIdSubscription: Subscription;
  choosenChatId: string = '';

  messages: any[] = [];

  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
      if(this.choosenChatId !== '')
      this.loadChannelMessages();
    });
  }

  loadChannelMessages() {
    this.messages = [];
    const collRef = collection(this.firestore, 'channels', this.choosenChatId, 'messages');
    const q = query(collRef, orderBy('postTime', 'desc'));

    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const postDate = new Date(doc.data()['postTime']);
        const hours = postDate.getHours().toString().padStart(2, '0');
        const minutes = postDate.getMinutes().toString().padStart(2, '0');
        const formattedPostTime = `${hours}:${minutes}`;

        const formattedPostDate = postDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

        this.messages.push({
          text: doc.data()['text'],
          posthour: formattedPostTime,
          postDay: formattedPostDate,
          reactions: doc.data()['reactions'],
          authorId: doc.data()['authorId']
        });
      });
    });
  }

  ngOnDestroy() {
    this.selectionIdSubscription.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { Firestore, collection, doc, getDocs, onSnapshot, orderBy, query } from '@angular/fire/firestore';


@Component({
  selector: 'app-chat-content',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-content.component.html',
  styleUrl: './chat-content.component.scss'
})
export class ChatContentComponent {
  firestore: Firestore = inject(Firestore);

  messages: any[] = [];

  constructor() {
    const collRef = collection(this.firestore, 'channels', 'NB6uszS6xyuHeEC2cMbo', 'messages');
    const q = query(collRef, orderBy('postTime'));

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
          reactions: doc.data()['reactions']
        });
      });
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { Firestore, collection, doc, getDocs, onSnapshot } from '@angular/fire/firestore';


@Component({
  selector: 'app-chat-content',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-content.component.html',
  styleUrl: './chat-content.component.scss'
})
export class ChatContentComponent {
  firestore: Firestore = inject(Firestore);

  constructor() {
    const collRef = collection(this.firestore, 'channels', 'NB6uszS6xyuHeEC2cMbo', 'messages');

    getDocs(collRef).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data()['text']);
      });
    });
  }
}

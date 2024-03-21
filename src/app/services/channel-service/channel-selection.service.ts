import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Unsubscribe } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { Observable, Subject, Unsubscribable, timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelSelectionService {
  db = inject(Firestore);
  channels: string[] = [];
  channelCol = collection(this.db, 'channels');
  channelQuery = query(collection(this.db, "channels"), where("channelName", "!=", ""));
  channelRef = collection(this.db, 'channels');
  newChannelSubject : Subject<string> = new Subject<string>();
  newName$ = this.newChannelSubject.asObservable();
  channelId: string = 'NB6uszS6xyuHeEC2cMbo';
  currentChannelName: string = '';
  currentChannelMembersIds: string[] = [];
  parentDocRef = doc(this.channelRef, this.channelId);
  unsubChannels;
  unsubCurrentChannel?:Unsubscribe;


  constructor() {
    this.unsubChannels = onSnapshot(this.channelQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (!this.channels.includes(doc.data()['channelName'])) {
          this.channels.push(doc.data()['channelName']);
        }
      });
      console.log(this.channels);
    });
  }

  changeChannel(){
    this.newChannelSubject.next(this.currentChannelName);
  }


  currentChannelRef(messageOrMember:string){
    collection(this.parentDocRef, messageOrMember);
  }


  ngOnDestroy() {
    this.unsubChannels();
  }

}



import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, query, where, onSnapshot, CollectionReference } from "firebase/firestore";
import { BehaviorSubject, timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  firestore = inject(Firestore);
  channels: string[] = [];
  channelIds: string[] = [];
  DMIds: string[] = [];
  
  choosenChatTypeId = new BehaviorSubject<string>('');
  choosenChatTypeId$ = this.choosenChatTypeId.asObservable();

  channelOrDM = new BehaviorSubject <string>('channel');
  channelOrDM$ = this.channelOrDM.asObservable();
  

  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelsQuery = query(this.channelsRef);
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  directMessagesQuery = query(this.directMessagesRef);
  unsubChannels;
  unsubDM;



  constructor() {
    this.unsubChannels = onSnapshot(this.channelsQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.channels.push(doc.data()['channelName']);
        this.channelIds.push(doc.id);
      }); 
      console.log(this.channels);
    });
    this.unsubDM = onSnapshot(this.directMessagesQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.DMIds.push(doc.id);
      });
    });
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubDM();
  }

}



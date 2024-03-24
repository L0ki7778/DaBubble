import { Injectable, inject } from '@angular/core';
import { Firestore, getDocs } from '@angular/fire/firestore';
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

  channelOrDM = new BehaviorSubject<string>('channel');
  channelOrDM$ = this.channelOrDM.asObservable();


  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelsQuery = query(this.channelsRef);
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  directMessagesQuery = query(this.directMessagesRef);
  unsubChannels;
  unsubDM;



  constructor() {
    this.unsubChannels = onSnapshot(this.channelsQuery,
      { includeMetadataChanges: true }, (querySnapshot) => {
        this.channels = [];
        this.channelIds = [];
        querySnapshot.forEach((doc) => {
          this.channels.push(doc.data()['channelName']);
          this.channelIds.push(doc.id);
        });
      });
    this.unsubDM = onSnapshot(this.directMessagesQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.DMIds.push(doc.id);
      });
    });
    this.getFirstDocumentId();
  }

  async getFirstDocumentId() {
    const queryChannelSnapshot = await getDocs(this.channelsRef);
    if (!queryChannelSnapshot.empty) {
      this.choosenChatTypeId.next(queryChannelSnapshot.docs[0].id);
    }
    else {
      const queryDMSnapshot = await getDocs(this.directMessagesRef);
      if (!queryDMSnapshot.empty) {
        this.channelOrDM.next('direct-message');
        this.choosenChatTypeId.next(queryDMSnapshot.docs[0].id);
      }
      else {
        console.log('Keine Channel oder Message gefunden');           // Dieser Fall muss noch implementiert werden!!!
        this.choosenChatTypeId.next('NB6uszS6xyuHeEC2cMbo');
      }
    }
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubDM();
  }

}



import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { BehaviorSubject, timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelSelectionService {
  db = inject(Firestore);
  channels: string[] = [];
  channelIds: string[] = [];
  DMIds: string[] = [];
  choosenChannelId = new BehaviorSubject<string>('');
  channelOrDM = new BehaviorSubject <string>('channel');
  channelOrDM$ = this.channelOrDM.asObservable();
  choosenId$ = this.choosenChannelId.asObservable();
  channelCol = collection(this.db, 'channels');
  DMQuery = query(collection(this.db, "direct-messages"));
  channelQuery = query(collection(this.db, "channels"), where("channelName", "!=", ""));
  unsubChannels;
  unsubDM;



  constructor() {
    this.unsubChannels = onSnapshot(this.channelQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.channels.push(doc.data()['channelName']);
        this.channelIds.push(doc.id);
      }); 
      console.log(this.channels);
    });
    this.unsubDM = onSnapshot(this.DMQuery, (querySnapshot) => {
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



import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelSelectionService {
  db = inject(Firestore);
  channels: string[] = [];
  channelCol = collection(this.db, 'channels');
  channelQuery = query(collection(this.db, "channels"), where("channelName", "!=", ""));
  unsubChannels;



  constructor() {
    this.unsubChannels = onSnapshot(this.channelQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.channels.push(doc.data()['channelName']);
      });
      console.log(this.channels);
    });
  }

  ngOnDestroy() {
    this.unsubChannels();
  }

}



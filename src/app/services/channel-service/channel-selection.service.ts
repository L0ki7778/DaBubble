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
  choosenChannelId = new BehaviorSubject<string>('');
  choosenId$ = this.choosenChannelId.asObservable();
  channelCol = collection(this.db, 'channels');
  channelQuery = query(collection(this.db, "channels"), where("channelName", "!=", ""));
  unsubChannels;



  constructor() {
    this.unsubChannels = onSnapshot(this.channelQuery, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.channels.push(doc.data()['channelName']);
        this.channelIds.push(doc.id);
      }); 
      console.log(this.channels);
    });
  }

  ngOnDestroy() {
    this.unsubChannels();
  }

}



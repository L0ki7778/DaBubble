import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, onSnapshot, query } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private firestore: Firestore = inject(Firestore);

  public channels: {"channelId": string, "channelName": string}[] = [];

  constructor() {

    const q = query(collection(this.firestore, "channels"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      this.channels = [];
      querySnapshot.forEach((doc) => {
        this.channels.push({"channelId": doc.id,
                            "channelName": doc.data()['channelName']});
      });
      console.log("All Channels", this.channels);
    });
  }
}

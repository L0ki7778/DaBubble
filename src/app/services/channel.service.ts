import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  constructor(private firestore: Firestore = inject(Firestore)) {

    const q = query(collection(firestore, "channels"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const channelIds: string[] = [];
      const channelNames: string[] = [];
      querySnapshot.forEach((doc) => {
        channelIds.push(doc.id);
        channelNames.push(doc.data()['channelName']);
      });
      console.log("Current users channels IDs", channelIds);
      console.log("Current users channels", channelNames);
    });

  }
}

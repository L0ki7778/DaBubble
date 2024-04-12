import { Injectable, inject } from '@angular/core';
import { Firestore, getDocs } from '@angular/fire/firestore';
import { collection, query, where, onSnapshot, CollectionReference, doc, getDoc } from "firebase/firestore";
import { BehaviorSubject, timestamp } from 'rxjs';
import { DirectMessagesService } from './direct-messages.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  firestore = inject(Firestore);
  dmService = inject(DirectMessagesService);
  channelNames: string[] = [];
  channelIds: string[] = [];
  DMIds: string[] = [];
  currentUserID: string = '';

  choosenChatTypeId = new BehaviorSubject<string>('');
  choosenChatTypeId$ = this.choosenChatTypeId.asObservable();

  channelOrDM = new BehaviorSubject<string>('channel');
  channelOrDM$ = this.channelOrDM.asObservable();

  selectedMemberId = new BehaviorSubject<string>('');
  selectedMemberId$ = this.selectedMemberId.asObservable();


  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelsQuery = query(this.channelsRef);
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  directMessagesQuery = query(this.directMessagesRef);
  unsubChannels: any;
  unsubDM: any;



  constructor() {
    this.ngOnInit();
  }

  async ngOnInit() {
    await this.dmService.fetchUserNames();
    this.currentUserID = await this.dmService.getLoggedInUserId();
    this.loadData();
  }

  loadData() {
    this.unsubChannels = onSnapshot(this.channelsQuery,
      { includeMetadataChanges: true }, (querySnapshot) => {
        this.channelNames = [];
        this.channelIds = [];
        querySnapshot.forEach((doc) => {
          if (doc.data()['members'].includes(this.currentUserID)) {
            this.channelNames.push(doc.data()['channelName']);
            this.channelIds.push(doc.id);
          }
        });
        this.getFirstDocumentId();
      });
    this.unsubDM = onSnapshot(this.directMessagesQuery, { includeMetadataChanges: true }, (querySnapshot) => {
      this.DMIds = [];
      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.currentUserID)) {
          this.DMIds.push(doc.id);
        }
      });
      this.getFirstDocumentId()
    });
  }

  async getFirstDocumentId() {
    const loggedInUserId = await this.dmService.getLoggedInUserId();
    if (this.channelIds.length > 0) {
      this.channelOrDM.next('channel');
      this.choosenChatTypeId.next(this.channelIds[0]);
    } else if (this.DMIds.length > 0) {
      this.channelOrDM.next('direct-message');
      const directMessageDocRef = doc(this.firestore, 'direct-messages', this.DMIds[0]);
      const directMessageDoc = await getDoc(directMessageDocRef);
      if (directMessageDoc.exists()) {
        const members = directMessageDoc.data()['members'];
        const otherUserId = members.find((id: any) => id !== loggedInUserId);
        if (otherUserId) {
          const otherUserName = await this.dmService.getUserNameById(otherUserId);
          this.dmService.selectedUserName = otherUserName;
          this.choosenChatTypeId.next(this.DMIds[0]);
          this.dmService.loadChatHistory();
        } else {
          console.warn('Es wurde keine andere Benutzer-ID in diesem Chat gefunden.');
        }
      } else {
        console.warn('Das Direct-Message-Dokument wurde nicht gefunden.');
      }
    }
  }

  getChannelNameById(ChannelId: string) {
    const index = this.channelIds.indexOf(ChannelId);
    return this.channelNames[index];
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubDM();
  }

}



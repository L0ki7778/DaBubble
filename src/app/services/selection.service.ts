import { Injectable, inject } from '@angular/core';
import { Firestore, getDocs } from '@angular/fire/firestore';
import { collection, query, where, onSnapshot, CollectionReference } from "firebase/firestore";
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
    this.currentUserID = await this.dmService.getLoggedInUserId();
    this.loadData();
  }

  async loadData() {
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
    this.unsubDM = onSnapshot(this.directMessagesQuery,{ includeMetadataChanges: true }, (querySnapshot) => {
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
    if (this.channelIds.length > 0) {
      this.channelOrDM.next('channel');
      this.choosenChatTypeId.next(this.channelIds[0]);
    }
    else {
      if (this.DMIds.length > 0) {
        this.channelOrDM.next('direct-message');
        this.choosenChatTypeId.next(this.DMIds[0]);
      }
      else {
        console.log('Keine Channel oder Message gefunden');           // Dieser Fall muss noch implementiert werden!!!
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



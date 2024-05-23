import { HostListener, Injectable, inject } from '@angular/core';
import { Firestore, getDocs } from '@angular/fire/firestore';
import { collection, query, onSnapshot, CollectionReference, doc, getDoc } from "firebase/firestore";
import { BehaviorSubject } from 'rxjs';
import { DirectMessagesService } from './direct-messages.service';
import { BooleanValueService } from './boolean-value.service';

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

  choosenMessageId = new BehaviorSubject<string>('');
  choosenMessageId$ = this.choosenMessageId.asObservable();

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
    this.loadChannels();
    this.loadDirectMessages();
    this.getFirstDocumentId();
  }

  loadChannels() {
    if (this.unsubChannels) { this.unsubChannels() }
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
      });
  }

  loadDirectMessages() {
    if (this.unsubDM) { this.unsubDM() }
    this.unsubDM = onSnapshot(this.directMessagesQuery, { includeMetadataChanges: true }, (querySnapshot) => {
      this.DMIds = [];
      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.currentUserID)) {
          this.DMIds.push(doc.id);
        }
      });
    });
  }

  async getFirstDocumentId() {
    if (this.channelIds.length === 0 && this.DMIds.length === 0) {
      const otherUserName = await this.getFirstUser();
      if (otherUserName) {
        this.channelOrDM.next('direct-message');
        this.dmService.selectedUserName = otherUserName;
        this.dmService.loadChatHistory();
      }
    } if (this.channelIds.length > 0) {
      this.channelOrDM.next('channel');
      this.choosenChatTypeId.next(this.channelIds[0]);
    } else if (this.DMIds.length > 0) {
      this.channelOrDM.next('direct-message');
      const otherUserName = await this.getOtherUserName();
      if (otherUserName) {
        this.dmService.selectedUserName = otherUserName;
        this.choosenChatTypeId.next(this.DMIds[0]);
        this.dmService.loadChatHistory();
      }
    }
  }

  async getFirstUser() {
    const usersCollection = collection(this.firestore, 'users');
    const usersDocs = await getDocs(usersCollection);
    if (usersDocs.docs.length > 0) {
      const firstUserDoc = usersDocs.docs[0];
      return firstUserDoc.data()['name'];
    } else {
      console.warn('Es wurden keine Benutzer in der Datenbank gefunden.');
      return null;
    }
  }

  async getOtherUserName() {
    const directMessageDocRef = doc(this.firestore, 'direct-messages', this.DMIds[0]);
    const directMessageDoc = await getDoc(directMessageDocRef);
    if (directMessageDoc.exists()) {
      const members = directMessageDoc.data()['members'];
      const otherUserId = members.find((id: any) => id !== this.currentUserID);
      if (otherUserId) {
        return await this.dmService.getUserNameById(otherUserId);
      } else {
        console.warn('Es wurde keine andere Benutzer-ID in diesem Chat gefunden.');
        return null;
      }
    } else {
      console.warn('Das Direct-Message-Dokument wurde nicht gefunden.');
      return null;
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
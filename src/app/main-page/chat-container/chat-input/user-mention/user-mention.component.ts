import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-messages.service';
import { CollectionReference, Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';
import { OverlayService } from '../../../../services/overlay.service';
import { SelectionService } from '../../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooleanValueService } from '../../../../services/boolean-value.service';


@Component({
  selector: 'app-user-mention',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-mention.component.html',
  styleUrl: './user-mention.component.scss'
})
export class UserMentionComponent {
  booleanService = inject(BooleanValueService);
  overlayService = inject(OverlayService);
  selectionService = inject(SelectionService);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  private firestore: Firestore = inject(Firestore);
  overlaySubscription: Subscription = new Subscription();
  selectionIdSubscription: Subscription = new Subscription();
  selectionTypeSubscription: Subscription = new Subscription();
  $editObservable = this.overlayService.overlaySubject.asObservable();
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  usersRef: CollectionReference = collection(this.firestore, "users");
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  editChannel: boolean = false;
  memberView: boolean = false;
  showMembers: boolean = false;
  showAddMember: boolean = false;
  choosenChatTypeId: string = '';
  choosenChatType: string = 'channel';
  currentChannelName: string = '';
  mentionName: string = '';
  currentUserID: string | null = '';
  channelQuery = query(this.channelsRef);
  allChannelNames: string[] = [];
  currentChannelMembersIds: string[] = [];
  currentChannelMembersNames: string[] = [];
  currentChannelMembersAvatars: string[] = [];
  currentChannelMembers: { name: string, avatar: string }[] = [];
  private unsubscribeUsers: any[] = [];
  private unsubscribeChannel: (() => void) | undefined;
  @Input() searchUser: string;
  @Input() searchChannel: string;
  @Input() viewUser: boolean = true;
  @Input() viewChannel: boolean = true;
  @Output() userMentioned = new EventEmitter<string>();
  @ViewChild('mention') mention: ElementRef | null = null;


  constructor() {
    this.searchUser = '';
    this.searchChannel = '';
    this.viewUser = true;
    this.viewChannel = true;
  }

  async ngOnInit() {
    this.overlaySubscription = this.$editObservable.subscribe(() => {
      this.editChannel = this.overlayService.editChannelOverlay;
      this.showMembers = this.overlayService.membersOverlay;
      this.memberView = this.overlayService.memberView;
      this.showAddMember = this.overlayService.addMemberOverlay;
    });
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId$.subscribe(newChannelId => {
      if (this.unsubscribeChannel) {
        this.unsubscribeChannel();
      }
      this.unsubscribeUsers.forEach(unsubscribe => unsubscribe());
      this.choosenChatTypeId = newChannelId;
      this.subscribeToChannelsData();
    });
    this.selectionTypeSubscription = this.selectionService.channelOrDM$.subscribe(newType => {
      this.choosenChatType = newType;
    });
    this.currentUserID = await this.DMService.getLoggedInUserId();
    this.filterChannels();
  }

  subscribeToChannelsData() {
    if (this.choosenChatTypeId) {
      this.unsubscribeChannel = onSnapshot(doc(this.channelsRef, this.choosenChatTypeId),
        { includeMetadataChanges: true }, (channel) => {
          if (channel.exists() && channel.data() && channel.data()['channelName']) {
            this.currentChannelName = channel.data()['channelName'] as string;
            this.currentChannelMembersIds = channel.data()['members'] as string[];
            this.subscribeToUserChanges();
          }
        }
      );
    }
  }

  subscribeToUserChanges() {
    for (let index = 0; index < this.currentChannelMembersIds.length; index++) {
      const userId = this.currentChannelMembersIds[index];
      this.unsubscribeUsers[index] = onSnapshot(doc(this.usersRef, userId),
        { includeMetadataChanges: true }, (user) => {
          if (user.exists() && user.data() && user.data()['image']) {
            const userAvatarSrc = user.data()['image'];
            const userName = user.data()['name'];
            this.currentChannelMembers[index] = { name: userName, avatar: userAvatarSrc };
          }
        }
      );
    }
  }

  ngOnDestroy() {
    this.overlaySubscription.unsubscribe();
    this.selectionIdSubscription.unsubscribe();
    this.selectionTypeSubscription.unsubscribe();
    this.unsubscribeUsers.forEach(unsubscribe => unsubscribe());
    if (this.unsubscribeChannel) {
      this.unsubscribeChannel();
    }
  }

  mentionUser(name: string) {
    this.userMentioned.emit(name);
    this.booleanService.userMention.set(false);
  }

  get filteredMembers() {
    if (this.searchUser) {
      return this.currentChannelMembers.filter(member =>
        member.name.toLowerCase().includes(this.searchUser.toLowerCase())
      );
    } else {
      return this.currentChannelMembers;
    }
  }

  get filteredChannelNames() {
    if (this.searchChannel) {
      return this.allChannelNames.filter(channelName =>
        channelName.toLowerCase().includes(this.searchChannel.toLowerCase())
      );
    } else {
      return this.allChannelNames;
    }
  }

  filterChannels() {
    this.unsubscribeChannel = onSnapshot(this.channelQuery, (querySnapshot) => {
      this.allChannelNames = [];
      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.currentUserID))
          this.allChannelNames.push(doc.data()['channelName'] as string);
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.mention && this.mention.nativeElement && this.mention.nativeElement.contains(event.target)) {
      return
    } else {
      this.booleanService.userMention.set(false);
    }
  }

}
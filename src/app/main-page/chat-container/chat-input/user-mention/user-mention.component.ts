import { Component, EventEmitter, Output, inject } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-messages.service';
import { CollectionReference, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { OverlayService } from '../../../../services/overlay.service';
import { SelectionService } from '../../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-mention',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-mention.component.html',
  styleUrl: './user-mention.component.scss'
})
export class UserMentionComponent {
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
  currentChannelMembersIds: string[] = [];
  currentChannelMembersNames: string[] = [];
  currentChannelMembersAvatars: string[] = [];
  private unsubscribeUsers: any[] = [];
  private unsubscribeChannel: (() => void) | undefined;
  @Output() userMentioned = new EventEmitter<string>();



  ngOnInit() {
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
            this.currentChannelMembersAvatars[index] = userAvatarSrc;
            this.currentChannelMembersNames[index] = userName;
          }
        }
      );
    }
  }


  mentionUser(name: string) {
    this.userMentioned.emit(name);
  }

}
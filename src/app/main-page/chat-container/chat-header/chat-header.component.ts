import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { EditChannelOverlayComponent } from '../../overlay/edit-channel-overlay/edit-channel-overlay.component';
import { AddMemberOverlayComponent } from '../../overlay/add-member-overlay/add-member-overlay.component';
import { MembersOverlayComponent } from '../../overlay/members-overlay/members-overlay.component';
import { Subscription } from 'rxjs';
import { CollectionReference, Firestore, collection, doc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { MemberProfileComponent } from '../../overlay/member-profile/member-profile.component';
import { ChannelSelectionService } from '../../../services/channel-service/channel-selection.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, EditChannelOverlayComponent, MembersOverlayComponent, AddMemberOverlayComponent, MemberProfileComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})

export class ChatHeaderComponent {
  overlayService = inject(OverlayService);
  channelSelectionService = inject(ChannelSelectionService);
  private firestore: Firestore = inject(Firestore);
  $editObservable = this.overlayService.overlaySubject.asObservable();
  private overlaySubscription: Subscription;
  private channelSelectionIdSubscription: Subscription;
  private channelSelectionTypeSubscription: Subscription;
  editChannel: boolean = false;
  memberView: boolean = false;
  showMembers: boolean = false;
  showAddMember: boolean = false;
  choosenChannelId: string = ''; //This is the Id of the choosen channel from the workspace.
  choosenChannelType: string = 'channel';
  choosenMemberId: string = '';
  currentChannelName: string = '';
  currentChannelMembersIds: string[] = [];
  currentChannelMembersNames: string[] = [];
  currentChannelMembersAvatars: string[] = [];
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  usersRef: CollectionReference = collection(this.firestore, "users");

  private unsubscribeUsers: any[] = [];
  private unsubscribeChannel: (() => void) | undefined;

  imgSrc: string = "../../../../assets/img/main-page/chat/add-members-button.svg";

  constructor(DMService: DirectMessagesService) {
    this.overlaySubscription = this.$editObservable.subscribe(() => {
      this.editChannel = this.overlayService.editChannelOverlay;
      this.showMembers = this.overlayService.membersOverlay;
      this.memberView = this.overlayService.memberView;
      this.showAddMember = this.overlayService.addMemberOverlay;
    });
    this.channelSelectionIdSubscription = this.channelSelectionService.choosenId$.subscribe(newChannelId => {
      if (this.unsubscribeChannel) {
        this.unsubscribeChannel();
      }
      this.unsubscribeUsers.forEach(unsubscribe => unsubscribe());
      this.choosenChannelId = newChannelId;
      this.subscribeToChannelsData();
    });
    this.channelSelectionTypeSubscription = this.channelSelectionService.channelOrDM$.subscribe(newType => {
      this.choosenChannelType = newType;
    });
  }

  async ngOnInit() {
    this.choosenChannelId = await this.getFirstDocument();
    this.subscribeToChannelsData();
  }

  async getFirstDocument() {
    const queryChannelSnapshot = await getDocs(this.channelsRef);
    if (!queryChannelSnapshot.empty) {
      return queryChannelSnapshot.docs[0].id;
    }
    else {
      const queryDMSnapshot = await getDocs(this.directMessagesRef);
      if (!queryDMSnapshot.empty) {
        this.choosenChannelType = 'direct-message';
        return queryDMSnapshot.docs[0].id;
      }
      else {
        console.log('Keine Channel oder Message gefunden');           // Dieser Fall muss noch implementiert werden!!!
        return 'NB6uszS6xyuHeEC2cMbo';
      }
    }
  }

  subscribeToChannelsData() {
    if (this.choosenChannelId) {
      this.unsubscribeChannel = onSnapshot(doc(this.channelsRef, this.choosenChannelId),
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

  getChoosenMemberId(userId: string) {
    this.choosenMemberId = userId;
  }

  openEditChannelOverlay() {
    this.overlayService.toggleEditChannelOverlay();
  }

  openMemberProfile(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleMemberView();
  }

  openMembersOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleMembersOverlay();
  }

  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleAddMemberOverlay();
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel) {
      this.unsubscribeChannel();
    }
    this.unsubscribeUsers.forEach(unsubscribe => unsubscribe());
    this.overlaySubscription.unsubscribe();
    if (this.channelSelectionIdSubscription) {
      this.channelSelectionIdSubscription.unsubscribe();
    }
    if (this.channelSelectionTypeSubscription) {
      this.channelSelectionTypeSubscription.unsubscribe();
    }
  }
}
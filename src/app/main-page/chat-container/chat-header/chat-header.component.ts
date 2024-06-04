import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { EditChannelOverlayComponent } from '../../overlay/edit-channel-overlay/edit-channel-overlay.component';
import { AddMemberOverlayComponent } from '../../overlay/add-member-overlay/add-member-overlay.component';
import { MembersOverlayComponent } from '../../overlay/members-overlay/members-overlay.component';
import { Subscription } from 'rxjs';
import { CollectionReference, Firestore, collection, doc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { MemberProfileComponent } from '../../overlay/member-profile/member-profile.component';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, EditChannelOverlayComponent, MembersOverlayComponent, AddMemberOverlayComponent, MemberProfileComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})

export class ChatHeaderComponent {
  overlayService = inject(OverlayService);
  selectionService = inject(SelectionService);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  private firestore: Firestore = inject(Firestore);
  $editObservable = this.overlayService.overlaySubject.asObservable();
  overlaySubscription: Subscription = new Subscription();
  selectionIdSubscription: Subscription = new Subscription();
  selectionTypeSubscription: Subscription = new Subscription();
  editChannel: boolean = false;
  memberView: boolean = false;
  showMembers: boolean = false;
  showAddMember: boolean = false;
  choosenChatTypeId: string = '';
  choosenChatType: string = 'channel';
  currentChannelName: string = '';
  currentChannelMembersIds: string[] = [];
  currentChannelMembersNames: string[] = [];
  currentChannelMembersAvatars: string[] = [];
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  directMessagesRef: CollectionReference = collection(this.firestore, "direct-messages");
  usersRef: CollectionReference = collection(this.firestore, "users");

  private unsubscribeUsers: any[] = [];
  private unsubscribeChannel: (() => void) | undefined;

  imgSrc: string = "assets/img/main-page/chat/add-members-button.svg";


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

  openEditChannelOverlay(event: MouseEvent) {
    event.stopPropagation();
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

  openMemberView(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleMemberView();
    this.DMService.selectedProfileName = this.DMService.selectedUserName;
    this.DMService.selectedProfileImage = this.DMService.selectedUserImage;
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel) {
      this.unsubscribeChannel();
    }
    this.unsubscribeUsers.forEach(unsubscribe => unsubscribe());
    this.overlaySubscription.unsubscribe();
    if (this.selectionIdSubscription) {
      this.selectionIdSubscription.unsubscribe();
    }
    if (this.selectionTypeSubscription) {
      this.selectionTypeSubscription.unsubscribe();
    }
  }
  
}
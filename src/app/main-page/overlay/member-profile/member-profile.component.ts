import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { AuthService } from '../../../services/auth.service';
import { SelectionService } from '../../../services/selection.service';
import { CollectionReference } from 'firebase/firestore';
import { Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.scss'
})
export class MemberProfileComponent {

  overlay = inject(OverlayService);
  DMService = inject(DirectMessagesService);
  auth = inject(AuthService);
  selectionService = inject(SelectionService);
  firestore = inject(Firestore);
  usersRef: CollectionReference = collection(this.firestore, "users");
  unsubUser: any;
  memberId: string = '';
  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: string = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: any = '';
  isSameUser: boolean = false;
  isDataLoaded = false;
  @ViewChild('memberView') memberView: ElementRef | null = null;


  async ngOnInit() {
    if (this.selectionService.channelOrDM.value === 'channel') {
      this.memberId = this.selectionService.selectedMemberId.value;
      this.checkIfSameUser();
      this.fetchUserDetails(this.memberId);
    }
    if (this.selectionService.channelOrDM.value === 'direct-message') {
      this.isSameUser = await this.DMService.isSameUser();
      this.fetchUserEmail();
    }
  }

  async fetchUserDetails(memberId: string) {
    this.unsubUser = onSnapshot(doc(this.usersRef, memberId), { includeMetadataChanges: true }, (user) => {
      if (user.exists() && user.data()) {
        this.userImage = user.data()['image'];
        this.userMail = user.data()['email'];
        this.userName = user.data()['name'];
      }
    });
  }

  async fetchUserEmail() {
    try {
      const email = await this.DMService.getUserEmailByName(this.DMService.selectedProfileName);
      this.userMail = email || 'unknown@example.com';
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  async checkIfSameUser() {
    if (this.memberId === await this.DMService.getLoggedInUserId()) {
      this.isSameUser = true;
    }
    else {
      this.isSameUser = false
    }
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.memberView && this.memberView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

  close() {
    this.overlay.closeOverlay();
  }

  openChat(memberId: string) {
    this.DMService.addUserToDirectMessages(this.userName);
    this.selectionService.choosenChatTypeId.next(memberId);
    this.selectionService.channelOrDM.next('direct-message');
    this.DMService.loadChatHistory();
    this.DMService.loadChatHistoryProfile();
    this.close();
  }

  ngOnDestroy() {
    if (this.unsubUser) {
      this.unsubUser();
    }
  }

}
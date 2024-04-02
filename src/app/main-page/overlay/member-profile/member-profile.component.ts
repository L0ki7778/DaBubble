import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
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
  @ViewChild('memberView') memberView: ElementRef | null = null;

  memberId: string = '';
  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: string = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: any = '';
  isSameUser: boolean = false;
  isDataLoaded = false;

  constructor() {
    this.memberId = this.selectionService.selectedMemberId.value;

    this.unsubUser = onSnapshot(doc(this.usersRef, this.memberId), { includeMetadataChanges: true }, (user) => {
      if (user.exists() && user.data()) {
        this.userImage = user.data()['image'];
        this.userMail = user.data()['email'];
        this.userName = user.data()['name'];
      }
    });

    this.checkIfSameUser()
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

  openChat() {
    this.close();
    this.selectionService.channelOrDM.next('direct-message');
    this.DMService.loadChatHistoryProfile();
  }

  ngOnDestroy() {
    if (this.unsubUser) {
      this.unsubUser();
    }
  }
}

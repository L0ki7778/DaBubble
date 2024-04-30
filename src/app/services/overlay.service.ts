import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  warning: boolean = false;
  memberView: boolean = false;
  editProfileView: boolean = false;
  profileView: boolean = false;
  isDropdownMenuVisible: boolean = false;
  isChatVisible: boolean = false;
  isMembersVisible: boolean = false;
  isAddMemberVisible: boolean = false;
  overlay = false;
  editChannelOverlay = false;
  membersOverlay = false;
  addMemberOverlay = false;
  workspaceOverlay = false;
  overlaySubject = new Subject<void>();
  testChange$ = this.overlaySubject.subscribe(() => {
    if (this.overlay) {
      this.overlay = false;
    } else {
      this.overlay = true;
    }
  });


  closeOverlay() {
    this.memberView = false;
    this.editProfileView = false;
    this.profileView = false;
    this.editChannelOverlay = false;
    this.membersOverlay = false;
    this.addMemberOverlay = false;
    this.workspaceOverlay = false;
    this.isDropdownMenuVisible = false;
    this.isChatVisible = false;
    this.isMembersVisible = false;
    this.isAddMemberVisible = false;
    this.warning = false;
    this.overlaySubject.next();
  }

  toggleEditChannelOverlay() {
    this.editChannelOverlay = !this.overlay;
    this.overlaySubject.next();
  }

  toggleMembersOverlay() {
    this.membersOverlay = !this.overlay;
    this.overlaySubject.next();
  }

  toggleAddMemberOverlay() {
    this.addMemberOverlay = !this.overlay;
    this.overlaySubject.next();
  }

  toggleDropdownMenu() {
    this.isDropdownMenuVisible = !this.overlay;
    this.overlaySubject.next();
  }

  toggleProfileView() {
    this.profileView = !this.overlay;
    this.overlaySubject.next();
  }

  toggleEditProfile() {
    this.editProfileView = !this.overlay;
    this.overlaySubject.next();
  }

  toggleWorkspaceOverlay() {
    this.workspaceOverlay = !this.overlay;
    this.overlaySubject.next();
  }

  toggleMemberView() {
    this.memberView = !this.overlay;
    this.overlaySubject.next();
  }

  toggleWarning() {
    this.warning = !this.warning;
    this.overlaySubject.next();
  }
  
}
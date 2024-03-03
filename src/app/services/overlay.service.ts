import { Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  isThreadVisible: boolean = true; 
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

  shiftThread = signal(true)

  constructor() { }

  switchThreadShift(){
    effect(() => {
      this.shiftThread.set(!this.shiftThread());
    })
  }

  closeOverlay() {
    this.editChannelOverlay = false;
    this.membersOverlay = false;
    this.addMemberOverlay = false;
    this.workspaceOverlay = false;
    this.isDropdownMenuVisible = false;
    this.isChatVisible = false;
    this.isMembersVisible = false;
    this.isAddMemberVisible = false;
    this.overlaySubject.next();
  }


  toggleChatOverlay() {
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

  toggleWorkspaceOverlay() {
    this.workspaceOverlay = !this.overlay;
    this.overlaySubject.next();
  }

  hideThread() {
    this.isThreadVisible = false;
    // this.overlaySubject.next();
  }
}
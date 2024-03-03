import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  isThreadVisible: boolean = true;
  isDropdownMenuVisible: boolean = false;
  isChatVisible: boolean = false;
  overlay = false;
  chatOverlay = false;
  workspaceOverlay = false;
  overlaySubject = new Subject<void>();
  testChange$ = this.overlaySubject.subscribe(() => {
    if (this.overlay) {
      this.overlay = false;
    } else {
      this.overlay = true;
    }
  });


  constructor() { }


  closeOverlay() {
    this.chatOverlay = false;
    this.workspaceOverlay = false;
    this.isDropdownMenuVisible = false;
    this.isChatVisible = false;
    this.overlaySubject.next();
  }


  toggleChatOverlay() {
    this.chatOverlay = !this.overlay;
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
    this.overlaySubject.next();
  }
}
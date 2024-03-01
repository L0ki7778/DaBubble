import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
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
    this.overlaySubject.next()
  }


  toggleChatOverlay() {
    this.chatOverlay = !this.overlay;
    this.overlaySubject.next()
  }


  toggleWorkspaceOverlay() {
    this.workspaceOverlay = !this.overlay;
    this.overlaySubject.next()
  }
}

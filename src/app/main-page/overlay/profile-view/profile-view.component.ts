import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent {

  @ViewChild('profileView') profileView: ElementRef | null = null;
  overlay = inject(OverlayService);
  

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileView && this.profileView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }
}

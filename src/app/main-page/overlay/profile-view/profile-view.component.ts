import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent {

  @ViewChild('profileView') profileView: ElementRef | null = null;
  overlay = inject(OverlayService);

  @Input() userImage: string = 'assets/img/general/avatars/avatar3.svg';
  @Input() userName: string = 'Frederik Beck';
  @Input() userStatus: 'online' | 'offline' = 'online';
  @Input() userMail: string = 'fred.beck@email.com';


  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileView && this.profileView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
      setTimeout(() => this.overlay.toggleDropdownMenu(), 1);
    }
  }


  close() {
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleDropdownMenu(), 1);
  }


  openEditProfile(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleEditProfile(), 1);
  }
}

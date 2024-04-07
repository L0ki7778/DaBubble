import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { AuthService } from '../../../services/auth.service';

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
  DMService = inject(DirectMessagesService);
  auth = inject(AuthService);

  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: any = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: string = 'fred.beck@email.com';

  ngOnInit() {
    this.findLoggedInUser();
  }

  findLoggedInUser() {
    const userId: any = this.DMService.getLoggedInUserId();
    this.userName = this.DMService.getUserNameById(userId.uid);
  }


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

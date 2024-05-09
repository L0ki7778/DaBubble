import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../../services/direct-messages.service';
import { AuthService } from '../../../../services/auth.service';

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


  ngOnInit() {
    this.findLoggedInUser();
    this.DMService.isLoggedInWithGoogle();
  }

  async findLoggedInUser() {
    const userId: any = await this.DMService.getLoggedInUserId();
    this.auth.userName = await this.DMService.getUserNameById(userId);
    this.auth.userImage = await this.DMService.getUserImageById(userId);
    this.auth.userMail = await this.DMService.getUserEmailByName(this.auth.userName);
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
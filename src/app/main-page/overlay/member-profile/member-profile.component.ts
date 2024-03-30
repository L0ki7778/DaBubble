import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { AuthService } from '../../../services/auth.service';

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
  @ViewChild('memberView') memberView: ElementRef | null = null;

  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: string = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: any = 'fred.beck@email.com';

  @Input() choosenMemberId: string = '';

  ngOnInit() {
    this.DMService.getUserEmailByName(this.DMService.selectedProfileName)
      .then(email => this.userMail = email || 'unknown@example.com')
      .catch(error => console.error('Error fetching user email:', error));
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
}

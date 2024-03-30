import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';

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
  @ViewChild('memberView') memberView: ElementRef | null = null;

  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: string = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: string = 'fred.beck@email.com';

  @Input() choosenMemberId: string = '';

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

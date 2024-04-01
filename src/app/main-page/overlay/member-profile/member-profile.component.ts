import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { AuthService } from '../../../services/auth.service';
import { SelectionService } from '../../../services/selection.service';

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
  selectionService = inject(SelectionService);
  @ViewChild('memberView') memberView: ElementRef | null = null;

  userImage: string = 'assets/img/general/avatars/avatar3.svg';
  userName: string = 'Frederik Beck';
  userStatus: 'online' | 'offline' = 'online';
  userMail: any = '';
  isSameUser: boolean = false;
  isDataLoaded = false;

  @Input() choosenMemberId: string = '';

  ngOnInit() {
    this.DMService.getUserEmailByName(this.DMService.selectedProfileName)
      .then(email => this.userMail = email || 'unknown@example.com')
      .catch(error => console.error('Error fetching user email:', error));
    this.DMService.isSameUser()
      .then(isSame => this.isSameUser = isSame)
      .catch(error => console.error('Error checking if same user:', error));
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

  openChat() {
    this.close();
    this.selectionService.channelOrDM.next('direct-message');
    this.DMService.loadChatHistoryProfile();
    }
}

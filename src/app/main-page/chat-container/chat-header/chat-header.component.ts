import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { EditChannelOverlayComponent } from '../../overlay/edit-channel-overlay/edit-channel-overlay.component';
import { AddMemberOverlayComponent } from '../../overlay/add-member-overlay/add-member-overlay.component';
import { MembersOverlayComponent } from '../../overlay/members-overlay/members-overlay.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, EditChannelOverlayComponent, MembersOverlayComponent, AddMemberOverlayComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})

export class ChatHeaderComponent {
  overlayService = inject(OverlayService);
  $editObservable = this.overlayService.overlaySubject.asObservable();
  private subscription: Subscription;
  editChannel: boolean = false;
  showMembers: boolean = false;

  imgSrc: string = "../../../../assets/img/main-page/chat/add-members-button.svg";

  constructor() {
    this.subscription = this.$editObservable.subscribe(() => {
      this.editChannel = this.overlayService.editChannelOverlay;
      this.showMembers = this.overlayService.membersOverlay;
    })
  };

  ngOnInit(): void {

  }

  openEditChannelOverlay() {
    this.overlayService.toggleEditChannelOverlay();
  }

  openMembersOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleMembersOverlay();
  }

  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleAddMemberOverlay();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}

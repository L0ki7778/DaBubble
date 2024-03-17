import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';
import { AddMemberOverlayComponent } from '../add-member-overlay/add-member-overlay.component';
import { CollectionReference, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-members-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, AddMemberOverlayComponent],
  templateUrl: './members-overlay.component.html',
  styleUrl: './members-overlay.component.scss'
})
export class MembersOverlayComponent {
  translateService = inject(TranslateService)
  overlay = inject(OverlayService)

  @Input() channelMemberIds: string[] = [];
  @Input() channelMemberNames: string[] = [];
  @Input() channelMemberAvatars: string[] = [];

  @ViewChild('membersOverview') membersOverview: ElementRef | null = null;

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.membersOverview && this.membersOverview.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

  constructor(){
  }

  openProfileView(userId: string) {
    console.log("Opened Profile View of User", userId);
  }

  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleAddMemberOverlay();
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }
}

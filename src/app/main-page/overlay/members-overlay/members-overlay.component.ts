import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';
import { AddMemberOverlayComponent } from '../add-member-overlay/add-member-overlay.component';
import { SelectionService } from '../../../services/selection.service';

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
  selectionService = inject(SelectionService)
  @Input() channelMemberIds: string[] = [];
  @Input() channelMemberNames: string[] = [];
  @Input() channelMemberAvatars: string[] = [];
  @ViewChild('membersOverview') membersOverview: ElementRef | null = null;


  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleAddMemberOverlay();
  }

  openMemberView(event: MouseEvent, memberId: string) {
    this.selectionService.selectedMemberId.next(memberId);
    event.stopPropagation();
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleMemberView(), 1);
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.membersOverview && this.membersOverview.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

}

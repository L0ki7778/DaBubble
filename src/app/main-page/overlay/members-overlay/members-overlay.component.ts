import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-members-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './members-overlay.component.html',
  styleUrl: './members-overlay.component.scss'
})
export class MembersOverlayComponent {
  translateService = inject(TranslateService)
  overlay = inject(OverlayService)
  @ViewChild('membersOverview') membersOverview: ElementRef | null = null;

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.membersOverview && this.membersOverview.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }
}

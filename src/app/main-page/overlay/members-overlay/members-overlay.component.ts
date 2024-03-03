import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  closeOverlay() {
    this.overlay.closeOverlay()
  }
}

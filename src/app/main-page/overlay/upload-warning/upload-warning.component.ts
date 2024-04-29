import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';

@Component({
  selector: 'app-upload-warning',
  standalone: true,
  imports: [],
  templateUrl: './upload-warning.component.html',
  styleUrl: './upload-warning.component.scss'
})
export class UploadWarningComponent {
  overlay = inject(OverlayService);
  @ViewChild('warningView') warningView: ElementRef | null = null;


  closeWarning() {
    this.overlay.closeOverlay();
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.warningView && this.warningView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

}
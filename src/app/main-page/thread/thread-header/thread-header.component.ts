import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {

  overlay = inject(OverlayService);
  // threadOverlay = this.overlay.isThreadVisible;


  // hideThread() {
  //   this.overlay.hideThread();
  // }
}

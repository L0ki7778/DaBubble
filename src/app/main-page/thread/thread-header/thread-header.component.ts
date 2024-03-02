import { Component, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {

  overlay = inject(OverlayService);

  hideThread() {
    this.overlay.hideThread();
  }
}

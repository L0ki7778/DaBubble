import { Component, effect, inject, signal } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from '../../main-page.component';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [
    CommonModule,
    MainPageComponent
  ],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {

  overlay = inject(OverlayService);
  isThreadVisible = this.overlay.shiftThread


  hideThread() {
    this.isThreadVisible.set(false);
  }
}

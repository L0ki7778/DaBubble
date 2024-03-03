import { Component, effect, inject, signal } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from '../../main-page.component';
import { BooleanValueService } from '../../../services/boolean-value.service';

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

  booleanService = inject(BooleanValueService);

  viewThread = this.booleanService.viewThread;


  hideThread() {
    this.viewThread.set(false);
  }
}
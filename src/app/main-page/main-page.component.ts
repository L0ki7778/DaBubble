import { Component, inject, signal } from '@angular/core';
import { HeadComponent } from './head/head.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { OverlayService } from '../services/overlay.service';
import { OverlayComponent } from './overlay/overlay.component';
import { CommonModule } from '@angular/common';
import { ThreadHeaderComponent } from './thread/thread-header/thread-header.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeadComponent,
    CommonModule,
    ChatContainerComponent,
    ThreadComponent,
    WorkspaceComponent,
    OverlayComponent,
    ThreadHeaderComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  overlayService = inject(OverlayService);
  overlay = this.overlayService.overlay;
  isThreadVisible = this.overlayService.shiftThread;


  constructor() {
    this.overlayService.overlaySubject.subscribe(() => {
      this.overlay = this.overlayService.overlay;
    })
  }
}

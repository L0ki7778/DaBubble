import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { HeadComponent } from './head/head.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { ThreadComponent } from './thread/thread.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { OverlayService } from '../services/overlay.service';
import { OverlayComponent } from './overlay/overlay.component';
import { CommonModule } from '@angular/common';
import { ThreadHeaderComponent } from './thread/thread-header/thread-header.component';
import { BooleanValueService } from '../services/boolean-value.service';
import { CloseWorkspaceComponent } from './workspace/close-workspace/close-workspace.component';

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
    ThreadHeaderComponent,
    CloseWorkspaceComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  overlayService = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  workspaceOpen= true;
  @ViewChild('WorkspaceComponent',{read : ElementRef}) workspaceComponentRef: ElementRef  | undefined;

  overlay:any;
  viewThread = this.booleanService.viewThread;


  constructor() {
    this.overlayService.overlaySubject.subscribe(() => {
      this.overlay = this.overlayService.overlay;
    });
  }

  handleWorkspace() {
    if(this.workspaceComponentRef) {
      const workspaceElement :HTMLElement = this.workspaceComponentRef.nativeElement;
     if(workspaceElement.style.width === '0px'){
      this.workspaceOpen = true;
       workspaceElement.style.width = '';
       workspaceElement.style.margin = '';
       workspaceElement.style.opacity = '';
       setTimeout(()=>{
         workspaceElement.style.minWidth = '';
       },250)
     }else{
       this.workspaceOpen = false;
       workspaceElement.style.width = '0';
       workspaceElement.style.minWidth = 'unset';
       workspaceElement.style.margin = '0 -2rem';
       workspaceElement.style.opacity = '0';
     }
    }
  }
}

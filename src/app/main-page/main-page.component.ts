import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { DirectMessagesService } from '../services/direct-messages.service';
import { SelectionService } from '../services/selection.service';

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
  DMService = inject(DirectMessagesService);
  selectionService = inject(SelectionService);
  workspaceOpen = true;
  overlay: any;
  showThread: boolean = false;
  isScreenSmall: boolean = false;
  mobileView: boolean = false;
  showWorkspace: boolean = true;
  private subscription!: Subscription;
  @ViewChild('WorkspaceComponent', { read: ElementRef }) workspaceComponentRef: ElementRef | undefined;


  constructor() {
    this.overlayService.overlaySubject.subscribe(() => {
      this.overlay = this.overlayService.overlay;
    });
  }

  ngOnInit() {
    this.subscription = this.booleanService.viewThreadObservable.subscribe(
      value => {
        this.showThread = value;
      }
    );
    this.booleanService.showWorkspace.subscribe(value => {
      this.showWorkspace = value;
    });
    this.booleanService.mobileView.subscribe(value => {
      this.mobileView = value;
    });
    this.booleanService.isScreenSmall.subscribe(value => {
      this.isScreenSmall = value;
    });
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isScreenSmall = window.innerWidth <= 1280;
    if (this.isScreenSmall) {
      this.booleanService.isScreenSmall.next(true);
    } else {
      this.booleanService.isScreenSmall.next(false);
    }

    this.mobileView = window.innerWidth <= 900;
    if (this.mobileView) {
      this.booleanService.mobileView.next(true);
    } else {
      this.booleanService.mobileView.next(false);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  hideSearchList() {
    this.DMService.showDropdown = false;
  }

  handleWorkspace() {
    if (!this.workspaceComponentRef) return;

    const workspaceElement: HTMLElement = this.workspaceComponentRef.nativeElement;
    const isOpen = workspaceElement.style.width === '0px';

    if (isOpen) {
      this.openWorkspace(workspaceElement);
      this.booleanService.showWorkspace.next(true);
    } else {
      this.closeWorkspace(workspaceElement);
      this.booleanService.showWorkspace.next(false);
    }
  }


  setWorkspaceStyles(workspaceElement: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    Object.assign(workspaceElement.style, styles);
  }

  openWorkspace(workspaceElement: HTMLElement) {
    this.workspaceOpen = true;
    this.setWorkspaceStyles(workspaceElement, {
      width: '',
      margin: '',
      opacity: ''
    });
    setTimeout(() => {
      workspaceElement.style.minWidth = '';
    }, 250);
  }

  closeWorkspace(workspaceElement: HTMLElement) {
    this.workspaceOpen = false;
    this.setWorkspaceStyles(workspaceElement, {
      width: '0',
      minWidth: 'unset',
      margin: '-8px',
      opacity: '0'
    });
  }

}
import { Component, inject } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';
import { ChatOverlayComponent } from './chat-overlay/chat-overlay.component';
import { WorkspaceOverlayComponent } from './workspace-overlay/workspace-overlay.component';
import { CommonModule } from '@angular/common';
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { AddMemberOverlayComponent } from './add-member-overlay/add-member-overlay.component';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    ChatOverlayComponent,
    WorkspaceOverlayComponent,
    CommonModule,
    DropdownMenuComponent,
    AddMemberOverlayComponent
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent {
  overlay = inject(OverlayService);
  chatOverlay = this.overlay.chatOverlay;
  workspaceOverlay = this.overlay.workspaceOverlay;
  isDropdownMenuVisible = this.overlay.isDropdownMenuVisible;
  addMemberOverlay = this.overlay.addMemberOverlay;
}
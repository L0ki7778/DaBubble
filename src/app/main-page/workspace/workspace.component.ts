import { Component, inject } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';
import { WorkspaceDropdownComponent } from './workspace-dropdown/workspace-dropdown.component';
import { WorkspaceHeaderComponent } from './workspace-header/workspace-header.component';
import { SearchBarComponent } from '../head/search-bar/search-bar.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    WorkspaceDropdownComponent,
    WorkspaceHeaderComponent,
    SearchBarComponent
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {

  overlayService = inject(OverlayService)

  createCannel(event: MouseEvent) {
    event.stopPropagation();
    this.overlayService.toggleWorkspaceOverlay();
  }

}
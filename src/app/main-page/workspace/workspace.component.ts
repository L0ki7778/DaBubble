import { Component, inject } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';
import { WorkspaceDropdownComponent } from './workspace-dropdown/workspace-dropdown.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    WorkspaceDropdownComponent
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {

  overlayService = inject(OverlayService)
  createCannel(event: Event){
    event.stopPropagation();
    this.overlayService.toggleWorkspaceOverlay();
  }
}

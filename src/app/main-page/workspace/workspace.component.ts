import { Component, inject } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { OverlayService } from '../../services/overlay.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    DropdownComponent
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

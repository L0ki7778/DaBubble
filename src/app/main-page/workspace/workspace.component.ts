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
  btn(event: Event){
    event.stopPropagation();
    console.log("btn clicked");
    this.overlayService.toggleWorkspaceOverlay();
    console.log(this.overlayService.workspaceOverlay)
  }

  dropdown(){
    console.log("dropdown clicked")
  }
}

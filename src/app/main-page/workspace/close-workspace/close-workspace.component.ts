import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-close-workspace',
  standalone: true,
  imports: [],
  templateUrl: './close-workspace.component.html',
  styleUrl: './close-workspace.component.scss'
})
export class CloseWorkspaceComponent {
  @Input() workspaceOpen = true;

}
import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-workspace-dropdown',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './workspace-dropdown.component.html',
  styleUrl: './workspace-dropdown.component.scss'
})
export class WorkspaceDropdownComponent {
  @Input() name = "";
  @Input() channel = false;
  @Input() active = true;
  @ViewChild('arrow') arrow: HTMLImageElement | undefined;

  constructor() { }

  toggleActiveDropdown(event: Event) {
    this.active = !this.active;
  }
}
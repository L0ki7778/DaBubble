import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  @Input() name = "";
  @Input() src = "";
  @Input() active = true;
  @ViewChild('arrow') arrow: HTMLImageElement | undefined;


  constructor() {

  }

  toggleActiveDropdown(event:Event) {
    this.active = !this.active

  }
}
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {

  @Input() isOwnMessage: boolean = true;
  @ViewChild('edit') edit: ElementRef | null = null;


  viewOption: boolean = false;


  showOption(event: MouseEvent) {
    event.stopPropagation();
    this.viewOption = true;
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.edit && this.edit.nativeElement.contains(event.target)) {
      return
    } else {
      this.viewOption = false;
    }
  }
}

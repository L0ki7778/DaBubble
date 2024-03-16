import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../../../services/boolean-value.service';

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
  booleanService = inject(BooleanValueService);


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


  showThread() {
    this.booleanService.viewThread.set(true);
  }
}
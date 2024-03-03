import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss'
})
export class DropdownMenuComponent {

  overlay = inject(OverlayService);
  @ViewChild('profileMenu') profileMenu: ElementRef | null = null;


  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileMenu && this.profileMenu.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }


  openProfileView(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.closeOverlay();
    this.overlay.toggleProfileView();
  }
}
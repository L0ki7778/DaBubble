import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent {
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  authService: AuthService = inject(AuthService);
  @ViewChild('profileMenu') profileMenu: ElementRef | null = null;

  
  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileMenu && this.profileMenu.nativeElement.contains(event.target)) {
      return
    } else {
      if (window.innerWidth < 900) {
        document.querySelector('nav')!.classList.add('nav-closed-mobile');
        setTimeout(() => {
          this.overlay.closeOverlay();
        }, 125);
      }
      else {
        document.querySelector('nav')!.classList.add('nav-closed');
        setTimeout(() => {
          this.overlay.closeOverlay();
        }, 125);
      }
    }
  }

  close() {
    this.overlay.closeOverlay();
  }

  openProfileView(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleProfileView(), 1);
  }

  logout() {
    this.authService.logout();
  }

}
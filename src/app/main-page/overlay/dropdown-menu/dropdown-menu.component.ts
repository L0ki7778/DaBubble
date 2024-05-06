import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { AuthService } from '../../../services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

export const slideAnimation = trigger('slideAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('200ms', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms', style({ transform: 'translateY(100%)' }))
  ])
]);

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
  animations: [slideAnimation]
})
export class DropdownMenuComponent {

  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  authService: AuthService = inject(AuthService);
  @ViewChild('profileMenu') profileMenu: ElementRef | null = null;
  isSmallScreen = false;


  ngOnInit() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 900;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  get slideAnimationState() {
    return this.isSmallScreen ? 'active' : 'inactive';
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileMenu && this.profileMenu.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
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
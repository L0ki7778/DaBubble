import { Component, inject } from '@angular/core';
import { ImprintPrivacyHeaderComponent } from './imprint-privacy-header/imprint-privacy-header.component';
import { RouterLink } from '@angular/router';
import { DirectMessagesService } from '../services/direct-messages.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [ImprintPrivacyHeaderComponent, RouterLink],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

  authService = inject(AuthService);

  preventAnimation() {
    this.authService.endAnimation = true;
    this.authService.animation = false;
    this.authService.showSlideAnimation = false;
  }
}

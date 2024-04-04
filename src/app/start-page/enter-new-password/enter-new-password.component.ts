import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enter-new-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './enter-new-password.component.html',
  styleUrl: './enter-new-password.component.scss'
})
export class EnterNewPasswordComponent {

  authService: AuthService = inject(AuthService);
  email: string = '';

  setNewPassword() {

  }

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showEnterNewPassword = false;
  }
}

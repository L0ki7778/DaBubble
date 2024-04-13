import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  authService: AuthService = inject(AuthService);


  private auth: Auth = inject(Auth);
  email: string = '';
  password: string = '';
  isTranslated: boolean = true;

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showResetPassword = false;
  }

  toggleToEnterNewPassword() {
    this.authService.showResetPassword = false;
    this.authService.showEnterNewPassword = true;
  }

  resetPassword(email: string) {
    this.authService.resetPassword(email);
    this.toggleToEnterNewPassword();
  }
}

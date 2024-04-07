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

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showResetPassword = false;
  }

  resetPassword(email: string) {
    this.authService.showEnterNewPassword = true;
    this.authService.showResetPassword = false;
    this.authService.resetPassword(email);
  }

  async sendFormData(emailAddress: string) {
    const formData = new FormData();
    formData.append('email', emailAddress);
    await fetch('https://anton-osipov.de/send_mail_dabubble.php', {
      method: 'POST',
      body: formData
    });
  }
}

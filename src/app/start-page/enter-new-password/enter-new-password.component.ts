import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { getAuth, updatePassword } from 'firebase/auth';


@Component({
  selector: 'app-enter-new-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './enter-new-password.component.html',
  styleUrl: './enter-new-password.component.scss'
})
export class EnterNewPasswordComponent {

  authService: AuthService = inject(AuthService);
  email: string | null = null;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor() {
    this.email = this.authService.resetPasswordEmail;
  }

  async setNewPassword() {
    if (this.newPassword === this.confirmPassword) {
      try {
        const auth = getAuth();
        // const emailCredential = await this.authService.getEmailCredential(this.email!);
        // await updatePassword(emailCredential.user, this.newPassword);
        console.log('New password set successfully');
        // Hier kannst du weitere Aktionen nach dem Setzen des neuen Passworts durchführen
      } catch (error) {
        console.error('Error setting new password:', error);
      }
    } else {
      console.error('Passwords do not match');
    }
  }

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showEnterNewPassword = false;
  }
}

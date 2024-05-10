import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { collection, query, where, getDocs } from '@angular/fire/firestore';
import { OverlayService } from '../../services/overlay.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  authService: AuthService = inject(AuthService);
  overlayService: OverlayService = inject(OverlayService);
  email: string = '';
  password: string = '';
  isTranslated: boolean = true;
  inputEmpty: boolean = true;


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

  async checkEmailAndResetPassword(email: any) {
    const usersCollection = collection(this.authService.firestore, 'users');
    const usersQuery = query(usersCollection, where('email', '==', email));
    try {
      const querySnapshot = await getDocs(usersQuery);
      if (querySnapshot.empty) {
        this.overlayService.toggleWarning();
      } else {
        this.resetPassword(email);
      }
    } catch (error) {
      console.error('Fehler beim Überprüfen der E-Mail-Adresse:', error);
    }
  }

  preventAnimation() {
    this.authService.endAnimation = true;
    this.authService.animation = false;
    this.authService.showSlideAnimation = false;
  }

  updateCursor() {
    this.inputEmpty = this.email.trim() === '';
  }
}
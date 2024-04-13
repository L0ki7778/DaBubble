import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { EmailAuthProvider, getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { Firestore, collection, doc, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../services/direct-messages.service';
import { StartPageComponent } from '../start-page.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-enter-new-password',
  standalone: true,
  imports: [FormsModule, StartPageComponent, CommonModule],
  templateUrl: './enter-new-password.component.html',
  styleUrl: './enter-new-password.component.scss'
})
export class EnterNewPasswordComponent {

  authService: AuthService = inject(AuthService);
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);

  email: string | null = null;
  newPassword: string = '';
  confirmPassword: string = '';
  isTranslated: boolean = true;
  passwordsMatch: boolean = false;

  constructor() {
    this.email = this.authService.resetPasswordEmail;
  }

  checkPasswordMatch() {
    this.passwordsMatch = this.newPassword === this.confirmPassword;
  }

  async setNewPassword() {
    if (this.newPassword === this.confirmPassword) {
      try {
        this.toggleTranslation();
        setTimeout(() => {
          this.toggleToLogin();
        }, 2000);
        const auth = getAuth();
        const emailCredential = await this.getEmailCredential();
        await updatePassword(emailCredential.user, this.newPassword);
        console.log('New password set successfully');
        const userDocRef = await this.getUserDocRef(this.authService.resetPasswordEmail);
        await updateDoc(userDocRef, { password: this.newPassword });
      } catch (error) {
        console.error('Error setting new password:', error);
      }
    } else {
      console.error('Passwords do not match');
    }
  }

  async getEmailCredential() {
    const auth = getAuth();
    const usersCollection = collection(this.firestore, 'users');
    const emailQuery = query(usersCollection, where('email', '==', this.authService.resetPasswordEmail));
    try {
      const querySnapshot = await getDocs(emailQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const storedPassword = userData['password'];
        const credential = EmailAuthProvider.credential(this.authService.resetPasswordEmail, storedPassword);
        return signInWithEmailAndPassword(auth, this.authService.resetPasswordEmail, storedPassword);
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      alert('Die E-Mail Adresse wurde noch nie registriert');
      throw error;
    }
  }

  async getUserDocRef(email: string) {
    const usersCollection = collection(this.firestore, 'users');
    const emailQuery = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.ref;
    } else {
      throw new Error('User document not found');
    }
  }

  toggleTranslation() {
    this.isTranslated = !this.isTranslated;
    const element = document.querySelector('.success-report') as HTMLElement;
    if (element) {
      element.style.translate = '0 -20%';
    }
  }

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showEnterNewPassword = false;
  }
}

import { Component, Input, inject } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChooseProfilePictureComponent } from './create-account/choose-profile-picture/choose-profile-picture.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [
    LoginComponent,
    CreateAccountComponent,
    ResetPasswordComponent,
    ChooseProfilePictureComponent,
    CommonModule,
    RouterLink
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {

  authService: AuthService = inject(AuthService);

  toggleToCreateAccount() {
    this.authService.showLogin = !this.authService.showLogin;
    this.authService.showCreateAccount = !this.authService.showCreateAccount;
  }

  toggleToResetPassword() {
    this.authService.showLogin = !this.authService.showLogin;
    this.authService.showResetPassword = !this.authService.showResetPassword;
  }

  toggleToChooseProfilePicture() {
    this.authService.showChooseProfilePicture = this.authService.showChooseProfilePicture;
  }
}

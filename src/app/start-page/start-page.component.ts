import { Component, Input } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [
    LoginComponent,
    CreateAccountComponent,
    ResetPasswordComponent,
    CommonModule,
    RouterLink
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {

  showLogin: boolean = true;
  showCreateAccount: boolean = false;
  showResetPassword: boolean = false;

  toggleToCreateAccount() {
    this.showLogin = !this.showLogin;
    this.showCreateAccount = !this.showCreateAccount;
  }

  toggleToResetPassword() {
    this.showLogin = !this.showLogin;
    this.showResetPassword = !this.showResetPassword;
  }

  toggleToLogin() {
    this.showLogin = true;
    this.showCreateAccount = false;
    this.showResetPassword = false;
  }
}

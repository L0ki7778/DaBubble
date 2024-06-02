import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IntroAnimationComponent } from '../intro-animation/intro-animation.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    IntroAnimationComponent,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  @ViewChild('emailInput', { static: true }) emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { static: true }) passwordInput!: ElementRef<HTMLInputElement>;
  email: string = '';
  password: string = '';
  emailError = false;
  passwordError = false;
  isInputEmpty: boolean = true;


  async login() {
    this.authService.email = this.email;
    this.authService.password = this.password;
    const success = await this.authService.login();
    if (!success) {
      this.emailError = true;
      this.passwordError = true;
    } else {
      this.emailError = false;
      this.passwordError = false;
    }
  }

  async loginAsGuest(event: Event) {
    event.preventDefault();
    await this.authService.loginAsGuest();
  }

  toggleToResetPassword() {
    this.authService.showLogin = false;
    this.authService.showResetPassword = true;
  }

  updateCursor() {
    this.isInputEmpty = this.email.trim() === '' || this.password.trim() === '';
  }

}
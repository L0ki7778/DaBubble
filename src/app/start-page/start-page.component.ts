import { Component, HostListener, inject } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChooseProfilePictureComponent } from './create-account/choose-profile-picture/choose-profile-picture.component';
import { EnterNewPasswordComponent } from './enter-new-password/enter-new-password.component';
import { OverlayService } from '../services/overlay.service';
import { UploadWarningComponent } from "../main-page/overlay/upload-warning/upload-warning.component";

@Component({
  selector: 'app-start-page',
  standalone: true,
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss',
  imports: [
    LoginComponent,
    CreateAccountComponent,
    ResetPasswordComponent,
    EnterNewPasswordComponent,
    ChooseProfilePictureComponent,
    CommonModule,
    RouterLink,
    UploadWarningComponent
  ]
})
export class StartPageComponent {
  authService: AuthService = inject(AuthService);
  overlay: OverlayService = inject(OverlayService);


  ngOnInit() {
    setTimeout(() => this.authService.endAnimation = true, 3000);
    this.checkWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWidth();
  }

  checkWidth() {
    if(window.innerWidth < 650) {
      this.authService.showMobileDesign = true;
    } else {
      this.authService.showMobileDesign = false;
    }
  }

  toggleToCreateAccount() {
    this.authService.showLogin = !this.authService.showLogin;
    this.authService.showHeader = !this.authService.showHeader;
    this.authService.showCreateAccount = !this.authService.showCreateAccount;
  }

  toggleToResetPassword() {
    this.authService.showLogin = !this.authService.showLogin;
    this.authService.showHeader = !this.authService.showHeader;
    this.authService.showResetPassword = !this.authService.showResetPassword;
  }

  toggleToChooseProfilePicture() {
    this.authService.showChooseProfilePicture = this.authService.showChooseProfilePicture;
  }

  preventAnimation() {
    this.authService.endAnimation = true;
    this.authService.animation = false;
    this.authService.showSlideAnimation = false;
  }

}
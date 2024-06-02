import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  authService: AuthService = inject(AuthService);
  email: string = '';
  password: string = '';
  name: string = '';
  hideCreateContainer: boolean = false;
  showPrivacyPolicy: boolean = false;
  privacyPolicyChecked: boolean = false;
  showReport: boolean = false;
  showReportName: boolean = false;


  constructor(private router: Router) { }

  ngOnInit() {
    this.checkWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWidth();
  }

  checkWidth() {
    if (window.innerWidth < 650) {
      this.privacyPolicyChecked = true;
    } else {
      this.privacyPolicyChecked = false;
    }
  }

  async saveVariables() {
    this.authService.email = this.email;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(this.email)) {
      this.showReport = true;
      return;
    }
    if (!this.name.trim().includes(' ')) {
      this.showReportName = true;
      return;
    }
    this.authService.password = this.password;
    this.authService.name = this.name;
    await this.authService.toggleToChooseProfilePicture();
  }

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showCreateAccount = false;
  }

  toggleToPrivacyPolicy() {
    this.hideCreateContainer = true;
    this.showPrivacyPolicy = true;
  }

  toggleToCreateAccount() {
    this.hideCreateContainer = false;
    this.showPrivacyPolicy = false;
  }

  preventAnimation() {
    this.authService.endAnimation = true;
    this.authService.animation = false;
    this.authService.showSlideAnimation = false;
  }

  get isInputEmpty(): boolean {
    return this.name.trim() === '' || this.email.trim() === '' || this.password.trim() === '';
  }

  get shouldShowNotAllowed(): boolean {
    return (this.isInputEmpty || !this.privacyPolicyChecked);
  }

  hideReport() {
    this.showReport = false;
    this.showReportName = false;
  }

}
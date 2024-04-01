import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-choose-profile-picture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-profile-picture.component.html',
  styleUrl: './choose-profile-picture.component.scss'
})
export class ChooseProfilePictureComponent {

  authService: AuthService = inject(AuthService);
  isTranslated: boolean = true;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef | undefined;

  profileIcons: any = [
    'assets/img/start-page/women1.svg',
    'assets/img/start-page/men1.svg',
    'assets/img/start-page/men2.svg',
    'assets/img/start-page/men3.svg',
    'assets/img/start-page/women2.svg',
    'assets/img/start-page/men4.svg'
  ]

  toggleToCreateAccount() {
    this.authService.showChooseProfilePicture = false;
    this.authService.showCreateAccount = true;
  }

  async register() {
    this.toggleTranslation();
    this.makeContentBrighter();
    await this.authService.register();
    setTimeout(() => {
      this.authService.showChooseProfilePicture = false;
      this.authService.showLogin = true;
      this.authService.selectedProfilePic = 'assets/img/start-page/unknown.svg';
      this.authService.name = '';
    }, 1400);
  }

  toggleTranslation() {
    this.isTranslated = !this.isTranslated;
    const element = document.querySelector('.success-report') as HTMLElement;
    if (element) {
      element.style.translate = '0 -20%';
    }
  }

  makeContentBrighter() {
    const content = document.querySelector('.content-container') as HTMLElement;
    if (content) {
      content.style.filter = 'opacity(0.6)'
    }
  }

  selectProfilePic(iconUrl: string) {
    this.authService.selectedProfilePic = iconUrl;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.authService.selectedProfilePic = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

}

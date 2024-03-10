import { Component, Input, inject } from '@angular/core';
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
    // await this.authService.register();
  }

  toggleTranslation() {
    this.isTranslated = !this.isTranslated;
  
    const element = document.querySelector('.success-report') as HTMLElement;;
    if (element) {
      element.style.translate = '(0 0)';
    }
  }

}

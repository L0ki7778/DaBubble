import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {

  authService: AuthService = inject(AuthService);
  email: string = '';
  password: string = '';
  name: string = '';

  async saveVariables() {
    this.authService.email = this.email;
    this.authService.password = this.password;
    this.authService.name = this.name;
    await this.authService.toggleToChooseProfilePicture();
  }

  toggleToLogin() {
    this.authService.showLogin = true;
    this.authService.showCreateAccount = false;
  }

}
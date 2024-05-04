import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  authService: AuthService = inject(AuthService);
  email: string = '';
  password: string = '';
  name: string = '';


  constructor(private router: Router) { }

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

  openInNewTab() {
    window.open(this.router.createUrlTree(['/privacy-policy']).toString(), '_blank');
  }

}
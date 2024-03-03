import { Component, Input } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { CreateAccountComponent } from './create-account/create-account.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [
    LoginComponent,
    CreateAccountComponent,
    CommonModule
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {

  @Input() showLogin: boolean = true;
  @Input() showCreateAccount: boolean = false;

  toggleContainer() {
      this.showLogin = false;
      this.showCreateAccount = true;
  }
}

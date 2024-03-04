import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  @Input() showLogin?: boolean;
  @Input() showResetPassword?: boolean;
  @Output() toggleStateResetPassword = new EventEmitter<void>();

  toggleToResetPassword() {
    this.toggleStateResetPassword.emit();
  }

  login() {
    
  }
}

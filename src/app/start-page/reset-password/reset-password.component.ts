import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  @Input() showLogin?: boolean;
  @Input() showResetPassword?: boolean;
  @Output() toggleStateResetPassword = new EventEmitter<void>();

  toggleToLogin() {
    this.toggleStateResetPassword.emit();
  }

  resetPassword() {
    
  }

}

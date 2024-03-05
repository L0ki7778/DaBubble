import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Auth, User, user, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  @Output() toggleState = new EventEmitter<void>();

  private auth: Auth = inject(Auth);
  email: string = '';
  password: string = '';

  toggleToLogin() {
    this.toggleState.emit();
  }

  resetPassword() {
    
  }

}

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Auth, User, user, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
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
  
  @Input() showLogin?: boolean;
  @Input() showCreateAccount?: boolean;
  @Output() toggleState = new EventEmitter<void>();

  private auth: Auth = inject(Auth);
  authService: AuthService = inject(AuthService);

  email: string = '';
  password: string = '';
  name: string = '';
  async register() {
    this.authService.email = this.email;
    this.authService.password = this.password;
    this.authService.name = this.name;
    await this.authService.register();
    this.toggleToLogin();
  }

  toggleToLogin() {
      this.toggleState.emit();
    }
  }

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
  authService = inject(AuthService);

  email: string = '';
  password: string = '';
  name: string = '';
  register() {
  
}
  // async register() {
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
  //     const user = userCredential.user;
  //     console.log('Registered user:', user);
  //     // Optionally, you can perform additional actions after successful registration
  //     await updateProfile(user, { displayName: this.name });
  //     console.log('User profile updated with display name:', this.name);
  //   } catch (error) {
  //     console.error('Error registering user:', error);
  //   }
  // }

  // user$ = user(this.auth);
  // userSubscription: Subscription = new Subscription();
  
  // constructor() {
  //   this.userSubscription = this.user$.subscribe((aUser: User | null) => {
  //     //handle user state changes here. Note, that user will be null if there is no currently logged in user.
  //     console.log(aUser);
  //   })
  // }

  // ngOnDestroy() {
  //   // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
  //   this.userSubscription.unsubscribe();
  // }

  toggleToLogin() {
      this.toggleState.emit();
    }
  }

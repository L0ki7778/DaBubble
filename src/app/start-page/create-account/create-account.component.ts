<<<<<<< HEAD
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

=======
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Auth, User, user, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
>>>>>>> 4c651ec41df17c930c4ee01bb78e670b47ba0f45

@Component({
  selector: 'app-create-account',
  standalone: true,
<<<<<<< HEAD
  imports: [
  ],
=======
  imports: [FormsModule],
>>>>>>> 4c651ec41df17c930c4ee01bb78e670b47ba0f45
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
<<<<<<< HEAD

  constructor() {
  }


  register() {

  }

=======
  
>>>>>>> 4c651ec41df17c930c4ee01bb78e670b47ba0f45
  @Input() showLogin?: boolean;
  @Input() showCreateAccount?: boolean;
  @Output() toggleState = new EventEmitter<void>();

  private auth: Auth = inject(Auth);

  email: string = '';
  password: string = '';
  name: string = '';

  async register() {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;
      console.log('Registered user:', user);
      // Optionally, you can perform additional actions after successful registration
      await updateProfile(user, { displayName: this.name });
      console.log('User profile updated with display name:', this.name);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

  user$ = user(this.auth);
  userSubscription: Subscription = new Subscription();
  
  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log(aUser);
    })
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.userSubscription.unsubscribe();
  }

  toggleToLogin() {
      this.toggleState.emit();
    }
  }

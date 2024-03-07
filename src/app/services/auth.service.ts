import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, Subscription, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  email: string = '';
  password: string = '';
  name: string = '';
  showLogin = true;
  showChooseProfilePicture: boolean = false;
  showResetPassword: boolean = false;
  showCreateAccount: boolean = false;

  user$ = user(this.auth);
  userSubscription: Subscription = new Subscription();
  
  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
    })
  }

  async register() {
    try {
      // const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      // const user = userCredential.user;
      // console.log('Registered user:', user);
      this.showChooseProfilePicture = true;
      this.showCreateAccount = false;
      // await updateProfile(user, { displayName: this.name });
      // console.log('User profile updated with display name:', this.name);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

  async login() {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;
      console.log('Logged in user:', user);
      this.router.navigate(['main-page']);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      console.log('User logged out successfully');
      this.router.navigate(['']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.userSubscription.unsubscribe();
  }


}
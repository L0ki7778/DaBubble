import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth, User, user, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntroAnimationComponent } from '../intro-animation/intro-animation.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, IntroAnimationComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  animation: boolean = true;

  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  email: string = '';
  password: string = '';


  ngOnInit() {
    setTimeout(() => this.animation = false, 2400);
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

  @Input() showLogin?: boolean;
  @Input() showResetPassword?: boolean;
  @Output() toggleStateResetPassword = new EventEmitter<void>();

  toggleToResetPassword() {
    this.toggleStateResetPassword.emit();
  }
}

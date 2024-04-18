import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, confirmPasswordReset, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile, user, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, } from 'rxjs';
import { UserType } from '../types/user.type';
import { Firestore, arrayUnion, collection, doc, getDocs, query, setDoc, where, writeBatch } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);
  public firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  email: string = '';
  password: string = '';
  name: string = '';
  selectedProfilePic: string = 'assets/img/start-page/unknown.svg';
  showLogin = true;
  showChooseProfilePicture: boolean = false;
  showResetPassword: boolean = false;
  showEnterNewPassword: boolean = false;
  showCreateAccount: boolean = false;
  guestEmail = 'guest@email.com';
  guestPassword = 'Passwort';
  resetPasswordEmail: any= null;
  userImage: string = 'assets/img/start-page/unknown.svg';
  userName: any = 'Frederik Beck';
  userMail: string | null = 'fred.beck@email.com';


  user$ = user(this.auth);
  userSubscription: Subscription = new Subscription();
  private _userName = new BehaviorSubject<string | null>(null);
  userName$ = this._userName.asObservable();

  updateUserName(newName: string | null) {
    this._userName.next(newName);
  } 

  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
    })
  }

  private createUserObject(): UserType {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      image: this.selectedProfilePic
    };
  }

  async toggleToChooseProfilePicture() {
    this.showChooseProfilePicture = true;
    this.showCreateAccount = false;
  }

  async register() {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;
      console.log('Registered user:', user);
      await updateProfile(user, { displayName: this.name });
      const userObject: UserType = this.createUserObject();
      console.log('User object:', userObject);
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, userObject);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

  async login(): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.router.navigate(['main-page']);
      return true;
    } catch (error) {
      return false;
    }
  }


  async loginAsGuest() {
    try {
      await signInWithEmailAndPassword(this.auth, this.guestEmail, this.guestPassword);
      this.router.navigate(['main-page']);
    } catch (error) {
      console.error('Error signing in as guest:', error);
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Fehler bei der Google-Anmeldung:', error);
    }
  }

  async resetPassword(email: string) {
      this.resetPasswordEmail = email;
  }

  async confirmResetPassword(code: string, newPassword: string) {
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, code, newPassword);
      console.log('Password reset successful');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  }

  getLoggedInUser(callback: any) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const loggedInUserId = user.uid;
        callback(loggedInUserId);
      } else {
        callback(null);
      }
    });
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.router.navigate(['']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }


}
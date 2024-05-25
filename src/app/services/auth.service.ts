import { Injectable, NgZone, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, confirmPasswordReset, signInWithEmailAndPassword, updateProfile, user, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, } from 'rxjs';
import { UserType } from '../types/user.type';
import { Firestore, arrayUnion, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);
  public firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private location: Location = inject(Location);
  email: string = '';
  password: string = '';
  name: string = '';
  selectedProfilePic: string = 'assets/img/start-page/unknown.svg';
  showLogin = true;
  showChooseProfilePicture: boolean = false;
  endAnimation: boolean = false;
  animation: boolean = true;
  showSlideAnimation: boolean = true;
  showResetPassword: boolean = false;
  showEnterNewPassword: boolean = false;
  showCreateAccount: boolean = false;
  showHeader: boolean = true;
  showMobileDesign: boolean = false;
  guestEmail = 'guest@email.com';
  guestPassword = 'Passwort';
  resetPasswordEmail: any = null;
  userImage: string = 'assets/img/start-page/unknown.svg';
  userName: any = 'Frederik Beck';
  userMail: string | null = 'fred.beck@email.com';
  user$ = user(this.auth);
  userSubscription: Subscription = new Subscription();
  private _userName = new BehaviorSubject<string | null>(null);
  userName$ = this._userName.asObservable();
  private imageUrlSource = new BehaviorSubject<string>('');
  currentImageUrl = this.imageUrlSource.asObservable();


  constructor(private ngZone: NgZone) {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
    })
  }

  updateUserName(newName: string | null) {
    this._userName.next(newName);
  }

  updateImageUrl(newUrl: string) {
    this.imageUrlSource.next(newUrl);
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
      await updateProfile(user, { displayName: this.name });
      const userObject: UserType = this.createUserObject();
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, userObject);
      await this.pushChannels(user.uid);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }

  async pushChannels(userId: string) {
    try {
      const channelDocRef1 = doc(this.firestore, 'channels', 'zFEphBVP6CDpk4YGiWRZ');

      await updateDoc(channelDocRef1, { members: arrayUnion(userId) });

      const channelDocRef2 = doc(this.firestore, 'channels', '1LclZQkGX67kBS8Qohvx');

      await updateDoc(channelDocRef2, { members: arrayUnion(userId) });
    } catch (error) {
      console.error('Error updating channels:', error);
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
      const user = userCredential.user;
      const photoURL = user.photoURL;
      const profilePictureUrl = await this.uploadProfilePicture(photoURL, user.uid);
      const userObject = {
        name: user.displayName,
        email: user.email,
        image: profilePictureUrl,
        uid: user.uid,
      };
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, userObject);
      this.ngZone.run(() => this.router.navigate(['/main-page']));
    } catch (error) {
      console.error('Fehler bei der Google-Anmeldung:', error);
    }
  }

  async uploadProfilePicture(photoURL: any, userId: string): Promise<string> {
    try {
      const response = await fetch(photoURL);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${userId}`);
      const uploadResult = await uploadBytesResumable(storageRef, blob);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      return 'assets/img/start-page/unknown.svg';
    }
  }

  async resetPassword(email: string) {
    this.resetPasswordEmail = email;
  }

  async confirmResetPassword(code: string, newPassword: string) {
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, code, newPassword);
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
      this.location.replaceState('/');
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, Subscription, from } from 'rxjs';
import { UserType } from '../types/user.type';
import { Firestore, arrayUnion, doc, setDoc, updateDoc } from '@angular/fire/firestore';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private auth: Auth = inject(Auth);
//   private firestore: Firestore = inject(Firestore);
//   private router: Router = inject(Router);

//   email: string = '';
//   password: string = '';
//   name: string = '';
//   selectedProfilePic: string = 'assets/img/start-page/unknown.svg';
//   showLogin = true;
//   showChooseProfilePicture: boolean = false;
//   showResetPassword: boolean = false;
//   showCreateAccount: boolean = false;

//   user$ = user(this.auth);
//   userSubscription: Subscription = new Subscription();

//   constructor() {
//     this.userSubscription = this.user$.subscribe((aUser: User | null) => {
//       //handle user state changes here. Note, that user will be null if there is no currently logged in user.
//     })
//   }

//   private createUserObject(): UserType {
//     return {
//       name: this.name,
//       email: this.email,
//       password: this.password,
//       image: this.selectedProfilePic
//     };
//   }

//   async toggleToChooseProfilePicture() {
//     this.showChooseProfilePicture = true;
//     this.showCreateAccount = false;
//   }

//   async register() {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
//       const user = userCredential.user;
//       console.log('Registered user:', user);
//       const userObject: UserType = this.createUserObject();
//       console.log('User object:', userObject);
//       const userDocRef = doc(this.firestore, 'users', user.uid);
//       await setDoc(userDocRef, userObject);
//     } catch (error) {
//       console.error('Error registering user:', error);
//       console.log("test")
//     }
//   }

//   async login() {
//     try {
//       const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
//       const user = userCredential.user;
//       console.log('Logged in user:', user);
//       const directMessageId = '7tt9mi3JhZrF2GemQBnC';
//       await this.addUserToDirectMessages(user.uid, directMessageId);
//       this.router.navigate(['main-page']);
//     } catch (error) {
//       console.error('Error signing in:', error);
//     }
//   }

//   async addUserToDirectMessages(userId: string, directMessageId: string) {
//     try {
//       const directMessageDocRef = doc(this.firestore, 'direct-messages', directMessageId);
//       await updateDoc(directMessageDocRef, {
//         members: arrayUnion(userId)
//       });
//       console.log('User added to direct message:', userId);
//     } catch (error) {
//       console.error('Error adding user to direct message:', error);
//     }
//   }

//   async logout() {
//     try {
//       await this.auth.signOut();
//       console.log('User logged out successfully');
//       this.router.navigate(['']);
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   }

//   ngOnDestroy() {
//     // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
//     this.userSubscription.unsubscribe();
//   }


// }
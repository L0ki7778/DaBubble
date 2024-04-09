import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { AuthService } from '../../../services/auth.service';
import { updateProfile, updateEmail, User, getAuth } from '@firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {

  @ViewChild('editProfile') editProfile: ElementRef | null = null;
  overlay = inject(OverlayService);
  auth = inject(AuthService);
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.editProfile && this.editProfile.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
      setTimeout(() => this.overlay.toggleDropdownMenu(), 1);
    }
  }

  close() {
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleDropdownMenu(), 1);
  }

  async updateUserProfile() {
    const newName = this.nameInput.nativeElement.value;
    const newEmail = this.emailInput.nativeElement.value;
    const auth = getAuth();
    const userId = auth.currentUser!.uid;
    try {
      const userDocRef = doc(this.auth.firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPassword = userData!['password'];
        await signInWithEmailAndPassword(auth, auth.currentUser!.email!, currentPassword).then(function (userCredential) {
          const user = userCredential.user;
          if (newName !== user.displayName) {
            updateProfile(user, { displayName: newName });
          }
          if (newEmail !== user.email) {
            updateEmail(user, newEmail);
          }
        })
        console.log('User profile updated successfully');
      } else {
        console.error('User document not found');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }
}
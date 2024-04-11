import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { AuthService } from '../../../services/auth.service';
import { updateProfile, updateEmail, User, getAuth } from '@firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { DirectMessagesService } from '../../../services/direct-messages.service';

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
  DMService = inject(DirectMessagesService);
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
    const currentUser: User | null = auth.currentUser;
    const loggedInUserId = await this.DMService.getLoggedInUserId();
    const userDocRef = doc(this.auth.firestore, 'users', loggedInUserId);
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: newName });
        await updateEmail(currentUser, newEmail);
      } else {
        console.error('Kein angemeldeter Benutzer gefunden');
      }
      await setDoc(userDocRef, { name: newName, email: newEmail }, { merge: true }); 
      this.close();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerprofilinformationen:', error);
    }
  }
}
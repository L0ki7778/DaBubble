import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { AuthService } from '../../../services/auth.service';
import { updateProfile, updateEmail, User, getAuth } from '@firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthCredential, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
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
        const credential = await this.promptForCredentials();
        await reauthenticateWithCredential(currentUser, credential);
        await updateProfile(currentUser, { displayName: newName });
        await updateEmail(currentUser, newEmail);
        this.auth.updateUserName(newName);
      } else {
        console.error('Kein angemeldeter Benutzer gefunden');
      }
      await setDoc(userDocRef, { name: newName, email: newEmail }, { merge: true }); 
      this.close();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerprofilinformationen:', error);
    }
  }

  async promptForCredentials(): Promise<AuthCredential> {
    const loggedInUserId = await this.DMService.getLoggedInUserId();
    const userDocRef = doc(this.auth.firestore, 'users', loggedInUserId);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const email = userData['email'];
        const password = userData['password'];
        const credential = EmailAuthProvider.credential(email, password);
        return credential;
      } else {
        console.error('Benutzerinformationen nicht gefunden');
        throw new Error('Benutzerinformationen nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Anmeldeinformationen:', error);
      throw error;
    }
  }
}
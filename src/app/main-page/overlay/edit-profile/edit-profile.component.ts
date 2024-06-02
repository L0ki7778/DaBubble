import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { AuthService } from '../../../services/auth.service';
import { updateProfile, updateEmail, User, getAuth } from '@firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthCredential, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { FormsModule } from '@angular/forms';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  selectedFile: string | ArrayBuffer | null = null;
  originalFile: File | null = null;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef | undefined;
  originalName = this.auth.userName;
  originalEmail = this.auth.userMail;
  originalImage = this.auth.userImage;
  nothingChangedError: boolean = false;
  enterFullNameError: boolean = false;
  userChangeValid: boolean = false;
  wrongEmail: boolean = false;


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
    if (!newName.trim().includes(' ')) {
      this.enterFullNameError = true;
      this.nothingChangedError = false;
      this.wrongEmail = false;
      return;
    }
    if (newName === this.originalName && newEmail === this.originalEmail && this.auth.userImage === this.originalImage) {
      this.nothingChangedError = true;
      this.enterFullNameError = false;
      this.wrongEmail = false;
      return;
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(newEmail)) {
      this.wrongEmail = true;
      this.nothingChangedError = false;
      this.enterFullNameError = false;
      return;
    }
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
      await setDoc(userDocRef, { name: newName, email: newEmail, image: this.auth.userImage }, { merge: true });
      this.auth.updateImageUrl(this.auth.userImage);
      this.close();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerprofilinformationen:', error);
    }
  }

  checkForChanges() {
    const newName = this.nameInput.nativeElement.value;
    const newEmail = this.emailInput.nativeElement.value;
    if (newName !== this.originalName || newEmail !== this.originalEmail || this.auth.userImage !== this.originalImage) {
      this.userChangeValid = true;
    } else {
      this.userChangeValid = false;
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

  async updateProfilePicture() {
    if (this.selectedFile) {
      const file = this.dataURIToBlob(this.selectedFile.toString());
      const filePath = `profile_pictures/${this.originalFile?.name}`;
      const storage = getStorage();
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const uploadedFileUrl = await getDownloadURL(storageRef);
      this.auth.userImage = uploadedFileUrl;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.originalFile = file;
      this.fileToBase64(file)
        .then(result => {
          this.selectedFile = result;
          this.updateProfilePicture();
        })
        .catch(error => {
          console.error('Fehler beim Lesen der Datei:', error);
        });
    }
  }

  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  dataURIToBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

}
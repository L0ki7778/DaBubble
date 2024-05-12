import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';


@Component({
  selector: 'app-choose-profile-picture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-profile-picture.component.html',
  styleUrl: './choose-profile-picture.component.scss'
})
export class ChooseProfilePictureComponent {

  authService: AuthService = inject(AuthService);
  isTranslated: boolean = true;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef | undefined;
  profileIcons: any = [
    'assets/img/start-page/women1.svg',
    'assets/img/start-page/men1.svg',
    'assets/img/start-page/men2.svg',
    'assets/img/start-page/men3.svg',
    'assets/img/start-page/women2.svg',
    'assets/img/start-page/men4.svg'
  ]
  selectedFile: string | ArrayBuffer | null = null;
  originalFile: File | null = null;
  selectedProfilePictureUrl: string | null = null;
  isProfilePictureFromFile: boolean = false;
  showReport: boolean = false;


  toggleToCreateAccount() {
    this.authService.showChooseProfilePicture = false;
    this.authService.showCreateAccount = true;
  }

  async register() {
    const usersRef = collection(this.authService.firestore, 'users');
    const q = query(usersRef, where('email', '==', this.authService.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      this.showReport = true;
      return;
    }
    this.handleProfilePicture();
    this.toggleTranslation();
    this.makeContentBrighter();
    await this.authService.register();
    this.resetUI();
  }

  async handleProfilePicture() {
    if (this.selectedFile) {
      const file = this.dataURIToBlob(this.selectedFile.toString());
      const filePath = `profile_pictures/${this.originalFile?.name}`;
      const storage = getStorage();
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const uploadedFileUrl = await getDownloadURL(storageRef);
      this.authService.selectedProfilePic = uploadedFileUrl;
    }
  }

  resetUI() {
    setTimeout(() => {
      this.authService.showChooseProfilePicture = false;
      this.authService.showLogin = true;
      this.authService.selectedProfilePic = 'assets/img/start-page/unknown.svg';
      this.authService.name = '';
    }, 1400);
  }

  toggleTranslation() {
    this.isTranslated = !this.isTranslated;
    const element = document.querySelector('.success-report') as HTMLElement;
    if (element) {
      element.style.translate = '0 -20%';
    }
  }

  makeContentBrighter() {
    const content = document.querySelector('.content-container') as HTMLElement;
    if (content) {
      content.style.filter = 'opacity(0.6)'
    }
  }

  selectProfilePic(iconUrl: string) {
    this.authService.selectedProfilePic = iconUrl;
    this.selectedFile = null;
    this.originalFile = null;
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

  updateProfilePicture() {
    if (this.selectedFile) {
      const base64Image = this.selectedFile.toString().split(',')[1];
      this.authService.selectedProfilePic = `data:image/png;base64,${base64Image}`;
    } else {
      this.authService.selectedProfilePic = 'assets/img/start-page/unknown.svg';
    }
  }

  hideReport() {
    this.showReport = false;
  }
}
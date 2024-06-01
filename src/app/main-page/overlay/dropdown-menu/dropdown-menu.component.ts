import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { AuthService } from '../../../services/auth.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { Firestore, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from '@angular/fire/firestore';
import { Auth, deleteUser, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent {
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);
  DMService = inject(DirectMessagesService);
  firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  authService: AuthService = inject(AuthService);
  @ViewChild('profileMenu') profileMenu: ElementRef | null = null;
  currentUserId: string = '';
  unsubscribeChannels: any;
  unsubscribeDMs: any;
  deleteView: boolean = false;
  isGuestAccount: boolean = false;

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.profileMenu && this.profileMenu.nativeElement.contains(event.target)) {
      return
    } else {
      if (window.innerWidth < 900) {
        document.querySelector('nav')!.classList.add('nav-closed-mobile');
        setTimeout(() => {
          this.overlay.closeOverlay();
        }, 125);
      }
      else {
        document.querySelector('nav')!.classList.add('nav-closed');
        setTimeout(() => {
          this.overlay.closeOverlay();
        }, 125);
      }
    }
  }

  async ngOnInit() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
    this.isGuestAccount = this.booleanService.isGuestAccount.value;
  }

  close() {
    this.overlay.closeOverlay();
  }

  openProfileView(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.closeOverlay();
    setTimeout(() => this.overlay.toggleProfileView(), 1);
  }

  logout() {
    this.authService.logout();
  }

  async channelCleaningFromUser() {
    const channelsQuery = query(collection(this.firestore, 'channels'));
    this.unsubscribeChannels = onSnapshot(channelsQuery, (querySnapshot: any) => {
      querySnapshot.forEach(async (doc: any) => {
        if (doc.data() && doc.data()['members'].includes(this.currentUserId)) {
          const members = doc.data()['members'];
          const newMembers = members.filter((item: any) => item !== this.currentUserId);
          await updateDoc(doc.ref, {
            members: newMembers
          })
        }
      })
    });
  }

  async DMCleaningFromUser() {
    const DMQuery = query(collection(this.firestore, 'direct-messages'));
    this.unsubscribeDMs = onSnapshot(DMQuery, (querySnapshot: any) => {
      querySnapshot.forEach(async (doc: any) => {
        if (doc.data() && doc.data()['members'].includes(this.currentUserId)) {
          await deleteDoc(doc(doc.ref));
        }
      })
    });
  }

  async cleanAuth() {
    this.auth = getAuth();
    const user = this.auth.currentUser;
    if (user) {
      deleteUser(user).then(() => {
        console.log('Konto des Users erfolgreich gelöscht');
      }).catch((error: Error) => {
        console.log(error);
      });
    }
  }

  async deleteUser() {
    this.channelCleaningFromUser();
    this.DMCleaningFromUser();
    const userRef = collection(this.firestore, 'users');
    await deleteDoc(doc(userRef, this.currentUserId));
    await this.cleanAuth();
    this.logout();
  }

  ngOnDestroy() {
    if (this.unsubscribeChannels) {
      this.unsubscribeChannels();
    }
    if (this.unsubscribeDMs) {
      this.unsubscribeDMs();
    }
  }

  showDelete(event: MouseEvent) {
    event.stopPropagation();
    this.deleteView = !this.deleteView;
  }

  notDelete(event: MouseEvent) {
    event.stopPropagation();
    this.deleteView = false;
  }

}
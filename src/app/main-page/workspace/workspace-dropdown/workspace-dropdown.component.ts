import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { doc, getDoc } from 'firebase/firestore';


@Component({
  selector: 'app-workspace-dropdown',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './workspace-dropdown.component.html',
  styleUrl: './workspace-dropdown.component.scss'
})
export class WorkspaceDropdownComponent {
  @Input() name = "";
  @Input() channel = false;
  @Input() active = true;
  @ViewChild('arrow') arrow: HTMLImageElement | undefined;
  authService: AuthService = inject(AuthService);
  userNames: string[] = [];
  userIdMap: { [userName: string]: string } = {};
  private firestore: Firestore = inject(Firestore);

  constructor() { }

  ngOnInit() {
    this.fetchUserNames();
  }

  async fetchUserNames() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        this.userNames.push(userData['name']);
        this.userIdMap[userData['name']] = doc.id;
      });
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
  }

  async getUserId(userName: string) {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const querySnapshot = await getDocs(usersCollection);
  
      const userDoc = querySnapshot.docs.find(doc => doc.data()['name'] === userName);
  
      if (userDoc) {
        const userId = userDoc.id;
        this.authService.loggedInUser();
        console.log(`User ID for ${userName}: ${userId}`);

      } else {
        console.log(`User ${userName} not found`);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }

  toggleActiveDropdown(event: Event) {
    this.active = !this.active;
  }



}
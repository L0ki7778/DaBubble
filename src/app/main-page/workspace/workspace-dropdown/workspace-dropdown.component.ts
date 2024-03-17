import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Firestore, collection, getDocs, doc, setDoc, where, query } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../services/direct-messages.service';


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
  showList = false;
  private firestore: Firestore = inject(Firestore);
  private directMessages: DirectMessagesService = inject(DirectMessagesService);

  constructor() { }

  ngOnInit() {
    this.fetchUserNames();
    this.checkName();
  }

  checkName() {
    if (this.name === 'Direktnachrichten') {
      this.showList = true;
    }
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
        return userId;
      } else
        console.log(`User ${userName} not found`);
      return null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  }

  async addUserToDirectMessages(otherUserName: string) {
    try {
      const loggedInUserId = await this.getLoggedInUserId();
      const otherUserId = await this.getUserId(otherUserName);
      if (loggedInUserId && otherUserId) {
        await this.addUserToDirectMessagesWithIds(loggedInUserId, otherUserId);
      } else {
        console.error('Error retrieving user IDs');
      }
    } catch (error) {
      console.error('Error creating new direct message:', error);
    }
  }
  
  async addUserToDirectMessagesWithIds(loggedInUserId: string, otherUserId: string) {
    const existingDirectMessageQuery = query(
      collection(this.firestore, 'direct-messages'),
      where('members', 'array-contains-any', [loggedInUserId, otherUserId])
    );
    const existingDirectMessageSnapshot = await getDocs(existingDirectMessageQuery);
    const existingChatWithBothUsers = existingDirectMessageSnapshot.docs.find(doc => {
      const members = doc.data()['members'];
      return members.includes(loggedInUserId) && members.includes(otherUserId);
    });
    if (!existingChatWithBothUsers) {
      const newDirectMessageRef = doc(collection(this.firestore, 'direct-messages'));
      await setDoc(newDirectMessageRef, { members: [loggedInUserId, otherUserId] });
      console.log('New direct message created');
    } else
      console.log('Direct message already exists with both users');
  }

  async getLoggedInUserId(): Promise<string | null> {
    return new Promise((resolve) => {
      this.authService.getLoggedInUser((loggedInUserId: any) => {
        resolve(loggedInUserId);
      });
    });
  }

  toggleActiveDropdown(event: Event) {
    this.active = !this.active;
  }
}
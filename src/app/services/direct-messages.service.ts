import { Injectable, inject } from '@angular/core';
import { user } from '@angular/fire/auth';
import { DocumentReference, Firestore, addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectMessagesService {

  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  guestAccount: { name: string, profileImage: string } | undefined;
  filteredUserNames: { name: string, profileImage: string }[] = [];
  messageText: string = 'Hallo';

  
  async fetchUserNames() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          name: userData['name'],
          profileImage: userData['image']
        };
      });
      this.guestAccount = users.find(user => user.name === 'Guest Account');
      this.filteredUserNames = users.filter(user => user.name !== 'Guest Account');
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

  async addUserToDirectMessages(otherUserName: string, messageText: string) {
    try {
      const loggedInUserId = await this.getLoggedInUserId();
      const otherUserId = await this.getUserId(otherUserName);
      messageText = 'Hallo';
      if (loggedInUserId && otherUserId) {
        await this.addUserToDirectMessagesWithIds(loggedInUserId, otherUserId, messageText);
      } else {
        console.error('Error retrieving user IDs');
      }
    } catch (error) {
      console.error('Error creating new direct message:', error);
    }
  }

  async createNewDirectMessage(loggedInUserId: string, otherUserId: string) {
    const newDirectMessageRef = doc(collection(this.firestore, 'direct-messages'));
    await setDoc(newDirectMessageRef, { members: [loggedInUserId, otherUserId] });
    return newDirectMessageRef;
  }

  async addMessageToDirectMessage(loggedInUserId: string, directMessageRef: DocumentReference, messageText: string) {
    const messagesCollectionRef = collection(directMessageRef, 'chat-messages');
    const newMessageData = {
      authorId: loggedInUserId,
      postTime: serverTimestamp(),
      reactions: [],
      text: messageText
    };
    await addDoc(messagesCollectionRef, newMessageData);
    console.log('New message added to the direct-messages subcollection');
  }
  
  async addUserToDirectMessagesWithIds(loggedInUserId: string, otherUserId: string, messageText: string) {
    const existingDirectMessageQuery = query(
      collection(this.firestore, 'direct-messages'),
      where('members', 'array-contains-any', [loggedInUserId, otherUserId])
    );
    const existingDirectMessageSnapshot = await getDocs(existingDirectMessageQuery);
    const existingChatWithBothUsers = existingDirectMessageSnapshot.docs.find(doc => {
      const members = doc.data()['members'];
      return members.includes(loggedInUserId) && members.includes(otherUserId);
    });
    if (existingChatWithBothUsers) {
      await this.addMessageToDirectMessage(loggedInUserId, existingChatWithBothUsers.ref, messageText);
    } else {
      const newDirectMessageRef = await this.createNewDirectMessage(loggedInUserId, otherUserId);
      await this.addMessageToDirectMessage(loggedInUserId, newDirectMessageRef, messageText);
    }
  }

  async getLoggedInUserId(): Promise<string | null> {
    return new Promise((resolve) => {
      this.authService.getLoggedInUser((loggedInUserId: any) => {
        resolve(loggedInUserId);
      });
    });
  }
  

  

  constructor() { 

  }
}

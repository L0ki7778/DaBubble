import { Inject, Injectable, LOCALE_ID, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, doc, getDocs, getDoc, query, serverTimestamp, setDoc, where, DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { PrivateMessageType } from '../types/private-message.type';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class DirectMessagesService {

  public firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  filteredUserNames: { name: string, profileImage: string, id: string }[] = [];
  filteredUserNamesSearchBar: { name: string, profileImage: string, id: string }[] = [];
  public chatHistoryLoaded = new Subject<void>();
  public chatHistoryLoaded$ = this.chatHistoryLoaded.asObservable();
  public chatHistoryLoadedThread = new Subject<void>();
  public chatHistoryLoadedThread$ = this.chatHistoryLoaded.asObservable();
  isLoggedInWithgoogle = false;
  showDropdown = false;
  messageText: string = '';
  selectedUserName: any;
  selectedUserImage?: string;
  selectedProfileName?: any;
  selectedProfileImage?: string;
  showPersonName: boolean = false;
  showPrivateChat: boolean = false;
  chatMessages: any[] = [];
  locale = 'de-DE';


  constructor(@Inject(LOCALE_ID) private localeId: string) {
  }

  private ChatMessage(): PrivateMessageType {
    return {
      id: '',
      authorId: '',
      authorName: '',
      authorImage: '',
      postTime: Date.now(),
      text: ''
    };
  }

  async fetchUserNames() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          name: userData['name'],
          profileImage: userData['image'],
          id: doc.id
        };
      });
      const loggedInUserId = await this.getLoggedInUserId();
      const loggedInUserName = await this.getUserNameById(loggedInUserId);
      this.filteredUserNames = users.filter(user => user.name !== loggedInUserName);
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
  }

  getFormattedDate(date: Date): string {
    return formatDate(date, 'EEEE, d MMMM', 'de-DE');
  }

  async getUserId(userName: string | null) {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const userDoc = querySnapshot.docs.find(doc => doc.data()['name'] === userName);
      if (userDoc) {
        const userId = userDoc.id;
        this.selectedUserImage = userDoc.data()['image'];
        return userId;
      } else
      return null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  }

  isLoggedInWithGoogle() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const providers = user.providerData.filter(
        (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      );
      this.isLoggedInWithgoogle = providers.length > 0;
    } else {
      this.isLoggedInWithgoogle = false;
    }
  }

  async fetchUserNamesSearchBar() {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          name: userData['name'],
          profileImage: userData['image'],
          id: doc.id
        };
      });
      const loggedInUserId = await this.getLoggedInUserId();
      const loggedInUserName = await this.getUserNameById(loggedInUserId);
      this.filteredUserNamesSearchBar = users.filter(user => user.name !== loggedInUserName);
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
  }

  async getUserNameById(authorId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData['name'];
      } else {
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Unknown User';
    }
  }

  async getUserEmailByName(userName: any): Promise<string | null> {
    try {
      const userId = await this.getUserIdProfile(userName);
      if (!userId) return null;
      const userDoc = await getDoc(doc(this.firestore, 'users', userId));
      if (!userDoc.exists()) return null;
      return userDoc.data()['email'];
    } catch (error) {
      console.error('Error fetching user email by name:', error);
      return null;
    }
  }

  async getUserIdProfile(userName: string | null) {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const querySnapshot = await getDocs(usersCollection);
      const userDoc = querySnapshot.docs.find(doc => doc.data()['name'] === userName);
      if (userDoc) {
        const userId = userDoc.id;
        return userId;
      } else
      return null;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  }

  async addUserToDirectMessages(otherUserName: string) {
    try {
      this.selectedUserName = otherUserName;
      const loggedInUserId = await this.getLoggedInUserId();
      const otherUserId = await this.getUserId(otherUserName);
      if (loggedInUserId && otherUserId) {
        this.showPersonName = true;
        this.showPrivateChat = true;
      } else {
        console.error('Error retrieving user IDs');
      }
    } catch (error) {
      console.error('Error creating new direct message:', error);
    }
  }

  async isSameUser(): Promise<boolean> {
    const loggedInUserId = await this.getLoggedInUserId();
    const selectedProfileUserId = await this.getUserIdProfile(this.selectedProfileName);
    return loggedInUserId === selectedProfileUserId;
  }

  async createNewDirectMessage(loggedInUserId: string | null, otherUserId: string) {
    const newDirectMessageRef = doc(collection(this.firestore, 'direct-messages'));
    await setDoc(newDirectMessageRef, { members: [loggedInUserId, otherUserId] });
    return newDirectMessageRef;
  }

  async addMessageToDirectMessage(loggedInUserId: any, directMessageRef: DocumentReference, messageText: string) {
    const messagesCollectionRef = collection(directMessageRef, 'chat-messages');
    const processedMessageText = messageText.replace(/\n/g, '<br>');
    const newMessageData: PrivateMessageType = {
      id: '',
      authorId: loggedInUserId,
      authorName: await this.getUserNameById(loggedInUserId),
      authorImage: await this.getUserImageById(loggedInUserId),
      postTime: serverTimestamp(),
      text: processedMessageText
    };
    const newMessageRef = await addDoc(messagesCollectionRef, newMessageData);
    const newMessageId = newMessageRef.id;
    await setDoc(newMessageRef, { ...newMessageData, id: newMessageId }, { merge: true });
  }

  async addUserToDirectMessagesWithIds(otherUserId: string, messageText: string) {
    const loggedInUserId = await this.getLoggedInUserId();
    const existingChatWithBothUsers = await this.retrieveChatDocumentReference();
    if (existingChatWithBothUsers) {
      await this.addMessageToDirectMessage(loggedInUserId, existingChatWithBothUsers.ref, messageText);
    } else {
      const newDirectMessageRef = await this.createNewDirectMessage(loggedInUserId, otherUserId);
      await this.addMessageToDirectMessage(loggedInUserId, newDirectMessageRef, messageText);
    }
  }

  async loadChatHistory() {
    try {
      this.chatMessages = [];
      const existingChatWithBothUsers = await this.retrieveChatDocumentReference();
      if (existingChatWithBothUsers) {
        await this.retrieveAndEnrichMessageData(existingChatWithBothUsers);
        this.chatMessages.sort((a, b) => a.postTime - b.postTime);
        this.chatHistoryLoaded.next();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async retrieveChatDocumentReference() {
    const loggedInUserId = await this.getLoggedInUserId();
    const otherUserId = await this.getUserId(this.selectedUserName);
    const existingDirectMessageQuery = query(
      collection(this.firestore, 'direct-messages'),
      where('members', 'array-contains-any', [loggedInUserId, otherUserId])
    );
    const existingDirectMessageSnapshot = await getDocs(existingDirectMessageQuery);
    const existingChatWithBothUsers = existingDirectMessageSnapshot.docs.find(doc => {
      const members = doc.data()['members'];
      return members.includes(loggedInUserId) && members.includes(otherUserId);
    });
    return existingChatWithBothUsers;
  }

  async retrieveAndEnrichMessageData(existingChatWithBothUsers: QueryDocumentSnapshot<DocumentData, DocumentData>) {
    const messagesCollectionRef = collection(existingChatWithBothUsers.ref, 'chat-messages');
    const messagesSnapshot = await getDocs(messagesCollectionRef);
    const messagesData: PrivateMessageType[] = await Promise.all(messagesSnapshot.docs.map(async doc => {
      const messageData: PrivateMessageType = doc.data() as PrivateMessageType;
      const authorName = await this.getUserNameById(messageData['authorId']);
      const authorImage = await this.getUserImageById(messageData['authorId']);
      return { ...messageData, authorName, authorImage };
    }));
    this.chatMessages = messagesData;
  }

  async loadChatHistoryProfile() {
    try {
      this.chatMessages = [];
      const existingChatWithBothUsers = await this.retrieveChatDocumentReferenceProfile();
      if (existingChatWithBothUsers) {
        await this.retrieveAndEnrichMessageData(existingChatWithBothUsers);
        this.chatMessages.sort((a, b) => a.postTime - b.postTime);
        this.chatHistoryLoaded.next();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  async retrieveChatDocumentReferenceProfile() {
    const loggedInUserId = await this.getLoggedInUserId();
    const otherUserId = await this.getUserIdProfile(this.selectedProfileName);
    const existingDirectMessageQuery = query(
      collection(this.firestore, 'direct-messages'),
      where('members', 'array-contains-any', [loggedInUserId, otherUserId])
    );
    const existingDirectMessageSnapshot = await getDocs(existingDirectMessageQuery);
    const existingChatWithBothUsers = existingDirectMessageSnapshot.docs.find(doc => {
      const members = doc.data()['members'];
      return members.includes(loggedInUserId) && members.includes(otherUserId);
    });
    return existingChatWithBothUsers;
  }

  async getUserImageById(authorId: any): Promise<string> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData['image'];
      } else {
        return 'default_image.png';
      }
    } catch (error) {
      console.error('Error fetching user image:', error);
      return 'default_image.png';
    }
  }

  async getLoggedInUserId(): Promise<any> {
    return new Promise((resolve) => {
      this.authService.getLoggedInUser((loggedInUserId: any) => {
        resolve(loggedInUserId);
      });
    });
  }

}
import { Injectable, inject } from '@angular/core';
import { user } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectMessagesService {

  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);

  getUserById(userId: string): Observable<any> {
    const userDocRef = doc(this.firestore, 'users', userId);
    return from(getDoc(userDocRef));
  }

  getAllUsers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      map((querySnapshot) => {
        const users: any[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        return users;
      })
    );
  }

  getDirectMessagesByUserId(userId: string): Observable<any[]> {
    const directMessagesCollection = collection(this.firestore, 'direct-messages');
    const queryConstraint = where('members', 'array-contains', userId);
    const queryRef = query(directMessagesCollection, queryConstraint);

    return from(getDocs(queryRef)).pipe(
      map((querySnapshot) => {
        const directMessages: any[] = [];
        querySnapshot.forEach((doc) => {
          directMessages.push({ id: doc.id, ...doc.data() });
        });
        return directMessages;
      })
    );
  }


  constructor() { 

  }
}

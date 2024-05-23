import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';
import { CollectionReference, DocumentSnapshot, Firestore, Query, QueryDocumentSnapshot, QuerySnapshot, Unsubscribe, arrayUnion, collection, doc, onSnapshot, query, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-member-overlay',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './add-member-overlay.component.html',
  styleUrl: './add-member-overlay.component.scss'
})
export class AddMemberOverlayComponent {
  translateService = inject(TranslateService)
  overlay = inject(OverlayService);
  private firestore: Firestore = inject(Firestore);
  usersQuery: Query = query(collection(this.firestore, "users"));
  noMemberUsers: { id: string; name: string; image: string }[] = [];
  filteredUsers: { id: string; name: string; image: string }[] = [];
  inputData: string = '';
  selectedUser: boolean = false;
  selectedUserId: string = '';
  userSelectionValid: boolean = false;
  @Input() channelMemberIds: string[] = [];
  @Input() channelName: string = '';
  @Input() channelId: string = '';
  @ViewChild('addMember') addMember: ElementRef | null = null;
  unsubscribeUsers: Unsubscribe;


  constructor() {
    this.unsubscribeUsers = onSnapshot(this.usersQuery, { includeMetadataChanges: true }, (usersQuerySnapshot) => {
      this.noMemberUsers = [];
      usersQuerySnapshot.forEach((user) => {
        if (!this.channelMemberIds.includes(user.id)) {
          this.noMemberUsers.push({ id: user.id, name: user.data()['name'], image: user.data()['image'] });
        }
      });
    });
  }

  filterUsers() {
    this.filteredUsers = [];
    this.userSelectionValid = false;
    this.selectedUserId = '';
    const lowerCaseInput = this.inputData.toLowerCase();
    this.noMemberUsers.forEach((user) => {
      if (user.name.toLowerCase().includes(lowerCaseInput) && !this.selectedUser) {
        this.filteredUsers.push(user);
      }
    });
  }

  selectUser(userName: string, userId: string, event: MouseEvent) {
    event.stopPropagation();
    this.inputData = userName;
    this.selectedUser = true;
    this.filterUsers();
    this.selectedUserId = userId;
    this.userSelectionValid = true;
    this.selectedUser = false;
  }

  async addSelectedUser() {
    this.userSelectionValid = false;
    const channelRef = doc(this.firestore, "channels", this.channelId);
    if (this.selectedUserId !== '') {
      await updateDoc(channelRef, { members: arrayUnion(this.selectedUserId) });
      this.closeOverlay();
    }
  }

  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleAddMemberOverlay();
  }

  closeOverlay() {
    this.overlay.closeOverlay();
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.addMember && this.addMember.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

  ngOnDestroy(){
    if(this.unsubscribeUsers){
      this.unsubscribeUsers();
    }
  }

}
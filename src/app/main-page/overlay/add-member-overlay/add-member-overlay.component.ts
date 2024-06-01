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
  translateService = inject(TranslateService);
  overlay = inject(OverlayService);
  private firestore: Firestore = inject(Firestore);
  usersQuery: Query = query(collection(this.firestore, "users"));
  noMemberUsers: { id: string; name: string; image: string }[] = [];
  filteredUsers: { id: string; name: string; image: string }[] = [];
  inputData: string = '';
  isSelected: boolean = false;
  selectedUser: boolean = false;
  selectedUserIds: string[] = [];
  selectedUserId: string = '';
  newMemberIds: string[] = [];
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

  ngOnInit() {
    setTimeout(() => {
      this.filterUsers();
    }, 100);
  }

  filterUsers() {
    this.filteredUsers = [];
    this.userSelectionValid = false;
    this.selectedUserId = '';
    this.isSelected = false;
    const parts = this.inputData.split(/[;\s]+/);
    const lowerCaseInput = parts[parts.length - 1].trim().toLowerCase();
    this.noMemberUsers.forEach((user) => {
      if (user.name.toLowerCase().includes(lowerCaseInput) && !this.selectedUser) {
        this.filteredUsers.push(user);
      }
    });
  }

  selectUser(userName: string, userId: string, event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const userBox = target.closest('.user-box');
    if (userBox) {
      if (this.selectedUserIds.includes(userId)) {
        this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
      } else {
        this.selectedUserIds.push(userId);
      }
    }
    this.userSelectionValid = this.selectedUserIds.length > 0;
  }

  async addSelectedUser() {
    const channelRef = doc(this.firestore, "channels", this.channelId);
    if (this.selectedUserIds.length > 0) {
      this.selectedUserIds.forEach(async (userId: string) => {
        await updateDoc(channelRef, { members: arrayUnion(userId) });
      });
      this.closeOverlay();
      this.selectedUserIds = [];
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
      return;
    } else {
      this.overlay.closeOverlay();
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
    }
  }
}

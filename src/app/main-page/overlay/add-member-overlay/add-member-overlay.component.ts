import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';
import { CollectionReference, Firestore, Query, QuerySnapshot, collection, onSnapshot, query } from '@angular/fire/firestore';

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

  @Input() channelMemberIds: string[] = [];
  @Input() channelName: string = '';

  @ViewChild('addMember') addMember: ElementRef | null = null;

  constructor() {
    const unsubscribeUsers = onSnapshot(this.usersQuery, { includeMetadataChanges: true }, (usersQuerySnapshot) => {
      this.noMemberUsers = [];
      usersQuerySnapshot.forEach((user) => {
        if (!this.channelMemberIds.includes(user.id)) {   // filtert die bereits hinzugefügten Users aus 
          this.noMemberUsers.push({ id: user.id, name: user.data()['name'], image: user.data()['image'] });
        }
      });
    });
  }

  filterUsers() {
    this.filteredUsers= [];
    const lowerCaseInput = this.inputData.toLowerCase();
    this.noMemberUsers.forEach((user) => {
      if (user.name.toLowerCase().includes(lowerCaseInput)) {
        this.filteredUsers.push(user);
      }
    });
  }

  selectUser(userName: string) {
    this.inputData = userName;
    this.filterUsers();
  }

  openAddMemberOverlay(event: MouseEvent) {
    event.stopPropagation();
    this.overlay.toggleAddMemberOverlay();
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.addMember && this.addMember.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }
}

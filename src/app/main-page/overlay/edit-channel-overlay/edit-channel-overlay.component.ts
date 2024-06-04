import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { collection, doc, getDoc, getDocs, limit, onSnapshot, query, where } from 'firebase/firestore';
import { Firestore, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';

@Component({
  selector: 'app-edit-channel-overlay',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, FormsModule
  ],
  templateUrl: './edit-channel-overlay.component.html',
  styleUrl: './edit-channel-overlay.component.scss'
})
export class EditChannelOverlayComponent {
  translateService = inject(TranslateService)
  dmService = inject(DirectMessagesService);
  selectionService = inject(SelectionService);
  overlay = inject(OverlayService)
  firestore = inject(Firestore)
  newChannel: FormGroup = new FormGroup({});
  editName: boolean = false;
  editDescription: boolean = false;
  nameAvailable: boolean = true;
  channelName: string = '';
  description: string = '';
  authorId: string = '';
  unsubChannel: any;
  authorName: string = '';
  members: string[] = [];
  @Input() channelId: string = '';
  @ViewChild('editView') editView: ElementRef | null = null;


  constructor() {
    this.newChannel = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('')
    });
  }

  ngOnInit() {
    if (this.channelId)
      this.unsubChannel = onSnapshot(doc(this.firestore, "channels", this.channelId), (currentChannel) => {
        if (currentChannel.exists()) {
          this.channelName = currentChannel.data()['channelName'];
          this.description = currentChannel.data()['description'];
          this.authorId = currentChannel.data()['authorId'];
          this.members = currentChannel.data()['members'];
          if (this.authorId !== '') {
            this.getAuthorNameFromAuthorId(this.authorId);
          }
        }
      });
  }

  async getAuthorNameFromAuthorId(authorId: string) {
    const userRef = doc(this.firestore, "users", authorId);
    const userData = await getDoc(userRef);
    if (userData.exists()) {
      this.authorName = userData.data()['name'];
    }
  }

  editChannelName(event: MouseEvent) {
    event.stopPropagation();
    this.editName = !this.editName;
  }

  editChannelDescription(event: MouseEvent) {
    event.stopPropagation();
    this.editDescription = !this.editDescription;
  }

  async saveChannelName(event: MouseEvent) {
    event.stopPropagation();
    await updateDoc(doc(this.firestore, "channels", this.channelId), { channelName: this.channelName });
    this.editName = !this.editName;
  }

  async saveChannelDescription(event: MouseEvent) {
    event.stopPropagation();
    await updateDoc(doc(this.firestore, "channels", this.channelId), { description: this.description });
    this.editDescription = !this.editDescription;
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }

  async leaveChannel() {
    const loggedInUserId = await this.dmService.getLoggedInUserId();
    const newMembers = this.members.filter(item => item !== loggedInUserId);
    const channelRef = doc(this.firestore, 'channels', this.channelId);
    if (newMembers.length === 0) {
      await deleteDoc(channelRef);
    }
    else {
      await updateDoc(channelRef, { members: newMembers });
    }
    await this.selectionService.getFirstDocumentId();
    this.closeOverlay();
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.editView && this.editView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }

  ngOnDestroy() {
    if (this.unsubChannel)
      this.unsubChannel();
  }

  async checkIfNameAvailable() {
    if (!this.channelName) {
        this.nameAvailable = true;
        return;
    }
    const q = query(collection(this.firestore, "channels"), where("channelName", "==", this.channelName), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        this.nameAvailable = false;
    } else {
        this.nameAvailable = true;
    }
}


}
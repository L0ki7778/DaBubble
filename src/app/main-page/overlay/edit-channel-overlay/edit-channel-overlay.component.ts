import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Firestore, updateDoc } from '@angular/fire/firestore';

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
  overlay = inject(OverlayService)
  firestore = inject(Firestore)

  editName: boolean = false;
  editDescription: boolean = false;
  channelName: string = '';
  description: string = '';
  authorId: string = '';
  authorName: string = '';

  @Input() channelId: string = '';

  unsubChannel: any;

  constructor() { }

  ngOnInit() {
    if (this.channelId)
      this.unsubChannel = onSnapshot(doc(this.firestore, "channels", this.channelId), (currentChannel) => {
        if (currentChannel.exists()) {
          this.channelName = currentChannel.data()['channelName'];
          this.description = currentChannel.data()['description'];
          this.authorId = currentChannel.data()['authorId'];
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

  editChannelName() {
    this.editName = !this.editName;
  }

  editChannelDescription() {
    this.editDescription = !this.editDescription;
  }

  async saveChannelName() {
  await updateDoc(doc(this.firestore, "channels", this.channelId), {channelName: this.channelName});
  this.editName = !this.editName;
  }

  async saveChannelDescription() {
    await updateDoc(doc(this.firestore, "channels", this.channelId), {description: this.description});
    this.editDescription = !this.editDescription;
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }

  ngOnDestroy() {
    if (this.unsubChannel)
      this.unsubChannel();
  }
}

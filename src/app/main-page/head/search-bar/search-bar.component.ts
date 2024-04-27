import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { CollectionReference, Firestore, collection, onSnapshot, query } from 'firebase/firestore';
import { SelectionService } from '../../../services/selection.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { BooleanValueService } from '../../../services/boolean-value.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {

  DMService: DirectMessagesService = inject(DirectMessagesService);
  booleanService = Inject(BooleanValueService)
  firestore = this.DMService.firestore;
  showDropdown: boolean = false;
  filteredChannelNames: string[] = [];
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelQuery = query(this.channelsRef);
  private unsubscribeChannel: (() => void) | undefined;
  currentUserID: string | null = '';
  selectionService = inject(SelectionService);

  async ngOnInit() {
    this.filterChannels();
    this.DMService.fetchUserNames();
    this.currentUserID = await this.DMService.getLoggedInUserId();
  }

  filterChannels() {
    this.unsubscribeChannel = onSnapshot(this.channelQuery, (querySnapshot) => {
      this.filteredChannelNames = [];
      querySnapshot.forEach((doc) => {
        if (doc.data()['members'].includes(this.currentUserID))
          this.filteredChannelNames.push(doc.data()['channelName'] as string);
      });
    });
  }

  sendChannelId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.channelIds[index]);
    this.selectionService.channelOrDM.next('channel');
  }

  sendDMId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.DMIds[index]);
    this.selectionService.channelOrDM.next('direct-message');
  }

  showDropdownMenu() {
    this.showDropdown = true;
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel)
      this.unsubscribeChannel();
  }

  closeThread() {
    this.booleanService.viewThread.set(false);
  }
}

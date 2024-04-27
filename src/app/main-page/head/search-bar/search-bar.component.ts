import { CommonModule } from '@angular/common';
import { Component, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CollectionReference, collection, onSnapshot, query } from 'firebase/firestore';
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
  booleanService = inject(BooleanValueService)
  firestore = this.DMService.firestore;
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

  showDropdownMenu() {
    this.DMService.showDropdown = true;
  }

  sendChannelId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.channelIds[index]);
    this.selectionService.channelOrDM.next('channel');
  }

  sendDMId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.DMIds[index]);
    this.selectionService.channelOrDM.next('direct-message');
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel)
      this.unsubscribeChannel();
  }

  closeThread() {
    this.booleanService.toggleViewThread(false);
    this.DMService.showDropdown = false;
  }
}

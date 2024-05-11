import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CollectionReference, collection, onSnapshot, query } from 'firebase/firestore';
import { SelectionService } from '../../../services/selection.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms', style({ opacity: 0 }))
  ])
]);

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  animations: [fadeAnimation]
})

export class SearchBarComponent {

  DMService: DirectMessagesService = inject(DirectMessagesService);
  booleanService = inject(BooleanValueService);
  firestore = this.DMService.firestore;
  filteredChannelNames: string[] = [];
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelQuery = query(this.channelsRef);
  private unsubscribeChannel: (() => void) | undefined;
  currentUserID: string | null = '';
  selectionService = inject(SelectionService);
  searchValue: string = '';
  mobileView: boolean = false;


  async ngOnInit() {
    this.filterChannels();
    this.DMService.fetchUserNamesSearchBar();
    this.currentUserID = await this.DMService.getLoggedInUserId();
    this.booleanService.mobileView.subscribe(value => {
      this.mobileView = value;
    });
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

  filterChannelsAndUsers() {
    if (this.searchValue.trim() === '') {
      this.filterChannels();
      this.DMService.fetchUserNamesSearchBar();
    } else {
      this.filteredChannelNames = this.filteredChannelNames.filter(channel =>
        channel.toLowerCase().includes(this.searchValue.toLowerCase())
      );
      this.DMService.filteredUserNamesSearchBar = this.DMService.filteredUserNamesSearchBar.filter(user =>
        user.name.toLowerCase().includes(this.searchValue.toLowerCase())
      );
    }
  }

  showDropdownMenu(event: MouseEvent) {
    event.stopPropagation();
    this.DMService.showDropdown = true;
  }

  sendChannelId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.channelIds[index]);
    this.selectionService.channelOrDM.next('channel');
    this.closeWorkspace();
  }

  sendDMId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.DMIds[index]);
    this.selectionService.channelOrDM.next('direct-message');
    this.closeWorkspace();
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel)
      this.unsubscribeChannel();
  }

  closeThread() {
    this.booleanService.toggleViewThread(false);
    this.DMService.showDropdown = false;
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  closeWorkspace() {
    if (this.mobileView) {
      this.booleanService.showWorkspace.next(false);
    }
  }

}
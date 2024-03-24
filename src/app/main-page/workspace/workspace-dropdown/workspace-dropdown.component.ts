import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { CollectionReference, Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';


@Component({
  selector: 'app-workspace-dropdown',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './workspace-dropdown.component.html',
  styleUrl: './workspace-dropdown.component.scss'
})
export class WorkspaceDropdownComponent {
  @Input() name = "";
  @Input() channel = false;
  @Input() active = true;
  @ViewChild('arrow') arrow: HTMLImageElement | undefined;
  selectionService = inject(SelectionService);
  authService: AuthService = inject(AuthService);
  firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  private unsubscribeChannel: (() => void) | undefined;
  showList = false;
  currentUserID = this.DMService.getLoggedInUserId();
  filteredChannelNames: string[] = [];

  constructor() {
    const q = query(this.channelsRef);
    const unsubscribeChannel = onSnapshot(q, (querySnapshot) => {
      this.filteredChannelNames = [];
      querySnapshot.forEach((doc) => {
        if(doc.data()['members'].includes(this.currentUserID))
        this.filteredChannelNames.push(doc.data()['channelName'] as string);
      });
    });
  }


  ngOnInit() {
    this.DMService.fetchUserNames();
    this.checkName();
  }



  sendChannelId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.channelIds[index]);
    this.selectionService.channelOrDM.next('channel');
  }

  sendDMId(index: number) {
    this.selectionService.choosenChatTypeId.next(this.selectionService.DMIds[index]);
    this.selectionService.channelOrDM.next('direct-message');
  }

  checkName() {
    if (this.name === 'Direktnachrichten') {
      this.showList = true;
    }
  }

  toggleActiveDropdown(event: Event) {
    this.active = !this.active;
  }
}
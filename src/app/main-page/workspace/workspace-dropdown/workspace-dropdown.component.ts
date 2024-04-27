import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';
import { CollectionReference, Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { OverlayService } from '../../../services/overlay.service';


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
  booleanService = inject(BooleanValueService);
  firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  overlayService = inject(OverlayService)
  channelsRef: CollectionReference = collection(this.firestore, "channels");
  channelQuery = query(this.channelsRef);
  private unsubscribeChannel: (() => void) | undefined;
  showList = false;
  currentUserID: string | null = '';
  filteredChannelNames: string[] = [];

  async ngOnInit() {
    this.currentUserID = await this.DMService.getLoggedInUserId();
    this.filterChannels();
    this.DMService.fetchUserNames();
    this.checkName();
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

  checkName() {
    if (this.name === 'Direktnachrichten') {
      this.showList = true;
    }
  }

  toggleActiveDropdown(event: Event) {
    this.active = !this.active;
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel)
      this.unsubscribeChannel();
  }

  closeThread() {
    this.booleanService.viewThread.set(false);
  }

  createCannel(event: MouseEvent){
    event.stopPropagation();
    this.overlayService.toggleWorkspaceOverlay();
  }
}
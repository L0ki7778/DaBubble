import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { SelectionService } from '../../../services/selection.service';


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
  DMService: DirectMessagesService = inject(DirectMessagesService);
  showList = false;
  existingChannels = this.selectionService.channels;

  constructor() { 
   }


  ngOnInit() {
    this.DMService.fetchUserNames();
    this.checkName();
  }

  sendChannelId(index: number){
    this.selectionService.choosenChatTypeId.next(this.selectionService.channelIds[index]);
    this.selectionService.channelOrDM.next('channel');
  }

  sendDMId(index: number){
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
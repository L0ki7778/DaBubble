import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from '../../main-page.component';
import { BooleanValueService } from '../../../services/boolean-value.service';
import { SelectionService } from '../../../services/selection.service';
import { DocumentSnapshot } from 'firebase/firestore';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [
    CommonModule,
    MainPageComponent
  ],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {

  booleanService = inject(BooleanValueService);
  selectionService = inject(SelectionService);
  firestore = inject(Firestore);

  currentChannelName: string = '';
  private unsubscribeChannel: (() => void) | undefined;
  selectionIdSubscription: Subscription = new Subscription();

  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenMessageId$.subscribe(() => {
      if (this.unsubscribeChannel) {
        this.unsubscribeChannel();
        this.subscribeToChannelsData();
      }
      else {
        this.subscribeToChannelsData();
      }
    });
  }

  subscribeToChannelsData() {
    if (this.selectionService.choosenChatTypeId.value) {
      this.unsubscribeChannel = onSnapshot(doc(this.firestore, 'channels', this.selectionService.choosenChatTypeId.value),
        { includeMetadataChanges: true }, (channel) => {
          if (channel.exists() && channel.data() && channel.data()['channelName']) {
            this.currentChannelName = channel.data()['channelName'] as string;
          }
        }
      );
    }
  }

  hideThread() {
    this.booleanService.toggleViewThread(false);
  }

  ngOnDestroy() {
    if (this.unsubscribeChannel) {
      this.unsubscribeChannel();
    }
  }
}
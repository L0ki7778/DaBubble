import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ChannelSelectionService } from '../../../services/channel-service/channel-selection.service';

@Component({
  selector: 'app-workspace-overlay',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './workspace-overlay.component.html',
  styleUrl: './workspace-overlay.component.scss'
})

export class WorkspaceOverlayComponent {
  translateService = inject(TranslateService);
  overlay = inject(OverlayService);
  channelService = inject(ChannelSelectionService);
  db = this.channelService.db
  newChannel: FormGroup = new FormGroup({});

  constructor() {  

   }

  ngOnInit() {
    this.newChannel = new FormGroup({
      name: new FormControl('', [Validators.minLength(5), Validators.required]),
      description: new FormControl('')
    });
  }

  async onSubmit() {
    if (this.newChannel.valid) {
      const channelRef = await addDoc(collection(this.db, "channels"), {
        channelName: this.newChannel.get('name')?.value,
        description: this.newChannel.get('description')?.value,
        members:["authorId"]
      });
      const firstMessage = await addDoc(collection(this.db, "channels", channelRef.id, "messages"), {
        text: `Welcome to ${this.newChannel.get('name')?.value}!`,
        postTime: Timestamp.fromDate(new Date())
      });
      this.closeOverlay()
    }
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }
}

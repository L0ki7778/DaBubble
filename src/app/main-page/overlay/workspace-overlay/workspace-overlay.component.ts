import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { addDoc, collection } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { SelectionService } from '../../../services/selection.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';

@Component({
  selector: 'app-workspace-overlay',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-overlay.component.html',
  styleUrl: './workspace-overlay.component.scss'
})

export class WorkspaceOverlayComponent {
  translateService = inject(TranslateService);
  overlay = inject(OverlayService);
  firestore: Firestore = inject(Firestore);
  channelService = inject(SelectionService);
  dmService = inject(DirectMessagesService);
  newChannel: FormGroup = new FormGroup({});
  currentUserId: string = '';
  @ViewChild('addChannelView') addChannelView: ElementRef | null = null;


  constructor() {
    this.newChannel = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('')
    });
  }

  async ngOnInit() {
    this.currentUserId = await this.dmService.getLoggedInUserId();
  }

  async onSubmit(event: MouseEvent) {
    event.stopPropagation();
    if (this.newChannel.valid) {
      const channelRef = await addDoc(collection(this.firestore, "channels"), {
        channelName: this.newChannel.get('name')?.value,
        description: this.newChannel.get('description')?.value,
        authorId: this.currentUserId,
        members: [this.currentUserId],
      });
      this.closeOverlay()
    }
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }

  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if (this.addChannelView && this.addChannelView.nativeElement.contains(event.target)) {
      return
    } else {
      this.overlay.closeOverlay();
    }
  }
}

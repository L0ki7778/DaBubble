import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { addDoc, collection } from 'firebase/firestore';
import { Firestore, getDocs, limit, query, where } from '@angular/fire/firestore';
import { SelectionService } from '../../../services/selection.service';
import { DirectMessagesService } from '../../../services/direct-messages.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-overlay',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
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
  nameAvailable: boolean = true;
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

  async checkIfNameAvailable() {
    if (!this.newChannel.get('name')?.value) {
      this.nameAvailable = true;
      return;
    }
    const q = query(collection(this.firestore, "channels"), where("channelName", "==", this.newChannel.get('name')?.value), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      this.nameAvailable = false;
    } else {
      this.nameAvailable = true;
    }
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
      this.channelService.channelOrDM.next('channel');
      this.channelService.choosenChatTypeId.next(channelRef.id);
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
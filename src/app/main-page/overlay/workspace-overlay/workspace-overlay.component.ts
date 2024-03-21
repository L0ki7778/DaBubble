import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';

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
  db = inject(Firestore);

  newChannel: FormGroup = new FormGroup({});

  constructor() { }

  ngOnInit() {
    this.newChannel = new FormGroup({
      name: new FormControl('', [Validators.minLength(5), Validators.required]),
      description: new FormControl('')
    })
  }

  async onSubmit() {
    if (this.newChannel.valid) {
      const channelRef = await addDoc(collection(this.db, "channels"), {
        name: this.newChannel.get('name')?.value,
        description: this.newChannel.get('description')?.value,
        // authorId: localStorage.getItem('uid'),
      });
      this.closeOverlay()
    }
  }

  closeOverlay() {
    this.overlay.closeOverlay()
  }
}

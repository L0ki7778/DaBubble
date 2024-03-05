import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OverlayService } from '../../../services/overlay.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-channel-overlay',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, FormsModule
  ],
  templateUrl: './edit-channel-overlay.component.html',
  styleUrl: './edit-channel-overlay.component.scss'
})
export class EditChannelOverlayComponent {
  translateService = inject(TranslateService)
  overlay = inject(OverlayService)
  firstTime = true;
  editName: boolean = false;
  editDescription: boolean = false;
  author: string = "Rene Heller";
  descriptionInput:string="Beschreibung deiner Wahl" ;

  constructor() { }

  ngAfterViewInit() {
    this.firstTime = false
  }


editChannelName(){
  this.editName = !this.editName;
}


editChannelDescription(){
  this.editDescription = !this.editDescription;
}


closeOverlay() {
  this.overlay.closeOverlay()
}
}

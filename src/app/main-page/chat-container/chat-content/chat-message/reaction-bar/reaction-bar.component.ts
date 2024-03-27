import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../../../services/boolean-value.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore, arrayUnion, doc, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { SelectionService } from '../../../../../services/selection.service';


@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {

  @Input() message: any;
  @Input() isOwnMessage: boolean = true;
  @ViewChild('edit') edit: ElementRef | null = null;
  @ViewChild('emoji') emoji: ElementRef | null = null;
  booleanService = inject(BooleanValueService);
  firestore: Firestore = inject(Firestore);
  selectionIdSubscription: Subscription;
  selectionService: SelectionService = inject(SelectionService);



  viewOption: boolean = false;
  viewEmojiPicker: boolean = false;
  choosenChatId: string = '';


  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
    });
  }


  showOption(event: MouseEvent) {
    event.stopPropagation();
    this.viewOption = true;
  }


  @HostListener('document:click', ['$event'])
  onclick(event: Event) {
    if ((this.edit && this.edit.nativeElement && this.edit.nativeElement.contains(event.target)) ||
      (this.emoji && this.emoji.nativeElement && this.emoji.nativeElement.contains(event.target))) {
      return
    } else {
      this.viewOption = false;
      this.viewEmojiPicker = false;
    }
  }



  showThread() {
    this.booleanService.viewThread.set(true);
  }


  showEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.viewEmojiPicker = true;
  }


  addEmoji(event: any) {
    console.log(this.message)
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, 'channels', this.choosenChatId, 'messages', this.message.docId);

    updateDoc(docRef, {
      reactions: arrayUnion(emoji)
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../../../services/boolean-value.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { SelectionService } from '../../../../../services/selection.service';
import { DirectMessagesService } from '../../../../../services/direct-messages.service';


@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss',
})
export class ReactionBarComponent {

  @Input() message: any;
  @Input() isOwnMessage: boolean = true;
  @Input() messageId: string | null = null;
  @Input() messageText: string = '';
  @Output() editingStarted = new EventEmitter<{ messageId: string, messageText: string }>();
  @ViewChild('edit') edit: ElementRef | null = null;
  @ViewChild('emoji') emoji: ElementRef | null = null;
  booleanService = inject(BooleanValueService);
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionIdSubscription: Subscription;
  selectionService: SelectionService = inject(SelectionService);



  viewOption: boolean = false;
  viewEmojiPicker: boolean = false;
  choosenChatId: string = '';
  emojiAmount: number = 0;
  currentUserId: string | null = null;


  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
    });
    this.getCurrentUserId();
  }


  async getCurrentUserId() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
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

  startEditing() {
    if (this.messageId && this.messageText) {
      this.editingStarted.emit({ messageId: this.messageId, messageText: this.messageText });
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
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, 'channels', this.choosenChatId, 'messages', this.message.docId);

    getDoc(docRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        let reactions = data['reactions'] || {};

        if (reactions[emoji]) {
          const userIndex = reactions[emoji].users.indexOf(this.currentUserId);
          if (userIndex > -1) {
            reactions[emoji].count -= 1;
            reactions[emoji].users.splice(userIndex, 1);

            if (reactions[emoji].count === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].count += 1;
            reactions[emoji].users.push(this.currentUserId);
          }
        } else {
          reactions[emoji] = { count: 1, users: [this.currentUserId] };
        }

        updateDoc(docRef, { reactions });
      }
    });
  }

}
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../../../services/boolean-value.service';
import { Firestore, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { DirectMessagesService } from '../../../../../services/direct-messages.service';
import { SelectionService } from '../../../../../services/selection.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-thread-reaction-bar',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './thread-reaction-bar.component.html',
  styleUrl: './thread-reaction-bar.component.scss'
})

export class ThreadReactionBarComponent {
  @Input() answer: any;
  @Input() isOwnAnswer: boolean = true;
  @Input() answerId: string | null = null;
  @Input() answerText: string = '';
  @Output() editingStarted = new EventEmitter<{ answerId: string, answerText: string }>();
  @ViewChild('edit') edit: ElementRef | null = null;
  @ViewChild('emoji') emoji: ElementRef | null = null;
  booleanService = inject(BooleanValueService);
  firestore: Firestore = inject(Firestore);
  DMService: DirectMessagesService = inject(DirectMessagesService);
  selectionService: SelectionService = inject(SelectionService);
  selectionIdSubscription: Subscription;

  viewOption: boolean = false;
  viewEmojiPicker: boolean = false;
  choosenChatId: string = '';
  emojiAmount: number = 0;
  currentUserId: string | null = null;
  unsubscribe: any;


  constructor() {
    this.selectionIdSubscription = this.selectionService.choosenChatTypeId.subscribe(newId => {
      this.choosenChatId = newId;
    });
    this.getCurrentUserId();
  }


  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
    if (this.answerId && this.answerText) {
      this.editingStarted.emit({ answerId: this.answerId, answerText: this.answerText });
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
    if (this.answer) {
      this.addEmojiChannel(event);
    }
  }


  addEmojiChannel(event: any) {
    const emoji = event.emoji.native;
    const docRef = doc(this.firestore, 'channels', this.choosenChatId, 'messages', this.answer.docId);

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


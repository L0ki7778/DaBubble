import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { BooleanValueService } from '../../../../../services/boolean-value.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {

  @Input() isOwnMessage: boolean = true;
  @Input() messageId: string | null = null;
  @Input() messageText: string = '';
  @Output() editingStarted = new EventEmitter<{ messageId: string, messageText: string }>();
  @ViewChild('edit') edit: ElementRef | null = null;
  @ViewChild('emoji') emoji: ElementRef | null = null;
  booleanService = inject(BooleanValueService);


  viewOption: boolean = false;
  viewEmojiPicker: boolean = false;


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

  // test ab hier
  addEmoji(event: MouseEvent) {
    const emoji = document.createElement('span');
  }
}
import { Component, Input, inject } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { SelectionService } from '../../services/selection.service';
import { ChatAnswerComponent } from './thread-content/chat-answer/chat-answer.component';
import { Subscription } from 'rxjs';
import { Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ThreadInputComponent } from './thread-input/thread-input.component';
import { ThreadContentComponent } from './thread-content/thread-content.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent, ChatAnswerComponent, CommonModule, ThreadInputComponent, ThreadContentComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
}

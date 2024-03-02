import { Component } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ThreadHeaderComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}

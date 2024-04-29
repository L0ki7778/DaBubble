import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from '../../main-page.component';
import { BooleanValueService } from '../../../services/boolean-value.service';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [
    CommonModule,
    MainPageComponent
  ],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {

  booleanService = inject(BooleanValueService);


  hideThread() {
    this.booleanService.toggleViewThread(false);
  }

}
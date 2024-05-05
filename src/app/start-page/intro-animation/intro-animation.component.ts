import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-intro-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-animation.component.html',
  styleUrl: './intro-animation.component.scss'
})
export class IntroAnimationComponent {
  animation: boolean = true;
  authService = inject(AuthService);


  ngOnInit() {
    setTimeout(() => this.authService.animation = false, 2400);
  }
}

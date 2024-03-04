import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  register() {

  }

  @Input() showLogin?: boolean;
  @Input() showCreateAccount?: boolean;
  @Output() toggleState = new EventEmitter<void>();

  toggleToLogin() {
      this.toggleState.emit();
    }
  }

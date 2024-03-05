import { Component } from '@angular/core';
import { ImprintPrivacyHeaderComponent } from './imprint-privacy-header/imprint-privacy-header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [ImprintPrivacyHeaderComponent, RouterLink],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

}

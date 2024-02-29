import { Component } from '@angular/core';
import { SearchBarComponent } from "./search-bar/search-bar.component";

@Component({
    selector: 'app-head',
    standalone: true,
    templateUrl: './head.component.html',
    styleUrl: './head.component.scss',
    imports: [SearchBarComponent]
})
export class HeadComponent {

}

import { Component } from '@angular/core';
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-head',
    standalone: true,
    templateUrl: './head.component.html',
    styleUrl: './head.component.scss',
    imports: [
        SearchBarComponent,
        DropdownMenuComponent,
        CommonModule
    ]
})
export class HeadComponent {

    isDropdownMenuVisible: boolean = false;

    showDropdownMenu() {
        this.isDropdownMenuVisible = true;
      }

}

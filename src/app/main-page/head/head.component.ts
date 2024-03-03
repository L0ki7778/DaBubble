import { Component, inject } from '@angular/core';
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { DropdownMenuComponent } from '../overlay/dropdown-menu/dropdown-menu.component';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../services/overlay.service';

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
    overlay = inject(OverlayService);

    openDropdownMenu(event: MouseEvent) {
        event.stopPropagation();
        this.overlay.toggleDropdownMenu();
    }
}

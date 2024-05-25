import { Component, inject } from '@angular/core';
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { DropdownMenuComponent } from '../overlay/dropdown-menu/dropdown-menu.component';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../services/overlay.service';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Firestore, doc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DirectMessagesService } from '../../services/direct-messages.service';
import { BooleanValueService } from '../../services/boolean-value.service';

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
    authService = inject(AuthService);
    DMService = inject(DirectMessagesService);
    private firestore: Firestore = inject(Firestore);
    booleanService = inject(BooleanValueService);
    name: string | null = '';
    imgSrc: string = 'assets/img/start-page/unknown.svg';
    auth = getAuth();
    authSubscription: Subscription | null = null;
    private userNameSubscription: Subscription | null = null;
    showWorkspace: boolean = true;
    mobileView: boolean = false;
    showThread: boolean = false;
    private subscription!: Subscription;
    private imageUrlSubscription!: Subscription;


    ngOnInit() {
        this.loggedInUser();
        this.findImageUrl();
        this.subscribeToUserName();
        this.booleanService.showWorkspace.subscribe(value => {
            this.showWorkspace = value;
        });
        this.booleanService.mobileView.subscribe(value => {
            this.mobileView = value;
        });
        this.subscription = this.booleanService.viewThreadObservable.subscribe(
            value => {
              this.showThread = value;
            }
          );
          this.imageUrlSubscription = this.authService.currentImageUrl.subscribe(
            (url) => (this.imgSrc = url)
          );
    }

    hideSearchList() {
        this.DMService.showDropdown = false;
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.userNameSubscription) {
            this.userNameSubscription.unsubscribe();
        }
        this.imageUrlSubscription.unsubscribe();
    }

    private subscribeToUserName() {
        this.userNameSubscription = this.authService.userName$.subscribe(
            (newName) => {
                this.name = newName;
            }
        );
    }

    findImageUrl() {
        this.authSubscription = new Subscription(() => {
        });
        const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
            if (user) {
                const userDocRef = doc(this.firestore, 'users', user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    this.imgSrc = userData['image'];
                }
            }
        });
        this.authSubscription.add(unsubscribe);
    }

    openDropdownMenu(event: MouseEvent) {
        event.stopPropagation();
        this.overlay.toggleDropdownMenu();
    }

    loggedInUser() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        this.authSubscription = new Subscription(() => {
        });
        const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
            if (user?.displayName) {
                this.name = user.displayName;
            } else {
                this.name = 'Guest';
            }
        });
        this.authSubscription.add(unsubscribe);
    }

    openWorkspace() {
        this.booleanService.showWorkspace.next(true);
    }

}
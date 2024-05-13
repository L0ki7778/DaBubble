import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DirectMessagesService } from './direct-messages.service';

@Injectable({
  providedIn: 'root'
})
export class BooleanValueService {

  DMService = inject(DirectMessagesService);
  viewThread: boolean = false;
  private viewThreadSource = new Subject<boolean>();
  viewThreadObservable = this.viewThreadSource.asObservable();
  profileView = signal(false);
  userMention = signal(false);
  showWorkspace = new BehaviorSubject<boolean>(true);
  mobileView = new BehaviorSubject<boolean>(false);
  isScreenSmall = new BehaviorSubject<boolean>(false);
  isGuestAccount = new BehaviorSubject<boolean>(false);
  currentUserId: string = '';

  constructor(){
    this.ngOnInit();
  }

  async ngOnInit() {
    this.currentUserId = await this.DMService.getLoggedInUserId();
    this.checkIfIsGuestAccount();
  }

  checkIfIsGuestAccount() {
    if (this.currentUserId === 'MsshyLlnpHdz3XbE3VU5E9fKAY92') {
      this.isGuestAccount.next(true);
    }
    else {
      this.isGuestAccount.next(false);
    }
  }

  toggleViewThread(value: boolean) {
    this.viewThread = value;
    this.viewThreadSource.next(value);
  }

}

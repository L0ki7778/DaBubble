import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BooleanValueService {
  viewThread: boolean = false;
  private viewThreadSource = new Subject<boolean>();
  viewThreadObservable = this.viewThreadSource.asObservable();
  profileView = signal(false);
  userMention = signal(false);
  showWorkspace = new BehaviorSubject<boolean>(true);
  mobileView = new BehaviorSubject<boolean>(false);

  toggleViewThread(value: boolean) {
    this.viewThread = value;
    this.viewThreadSource.next(value);
  }

}

import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BooleanValueService {
  viewThread: boolean = false;
  private viewThreadSource = new Subject<boolean>();
  viewThreadObservable = this.viewThreadSource.asObservable();
  profileView = signal(false);
  userMention = signal(false);

  toggleViewThread(value: boolean) {
    this.viewThread = value;
    this.viewThreadSource.next(value);
  }

}

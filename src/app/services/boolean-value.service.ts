import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BooleanValueService {

  constructor() { }

  viewThread = signal(false);
  profileView = signal(false);
  userMention = signal(false);
}

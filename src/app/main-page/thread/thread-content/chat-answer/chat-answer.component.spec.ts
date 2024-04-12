import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAnswerComponent } from './chat-answer.component';

describe('ChatAnswerComponent', () => {
  let component: ChatAnswerComponent;
  let fixture: ComponentFixture<ChatAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatAnswerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

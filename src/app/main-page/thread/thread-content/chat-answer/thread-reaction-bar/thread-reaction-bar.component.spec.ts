import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadReactionBarComponent } from './thread-reaction-bar.component';

describe('ThreadReactionBarComponent', () => {
  let component: ThreadReactionBarComponent;
  let fixture: ComponentFixture<ThreadReactionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadReactionBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadReactionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

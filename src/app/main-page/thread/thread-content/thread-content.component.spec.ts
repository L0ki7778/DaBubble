import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadContentComponent } from './thread-content.component';

describe('ThreadContentComponent', () => {
  let component: ThreadContentComponent;
  let fixture: ComponentFixture<ThreadContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

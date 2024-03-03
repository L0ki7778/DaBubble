import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChannelOverlayComponent } from './edit-channel-overlay.component';

describe('EditChannelOverlayComponent', () => {
  let component: EditChannelOverlayComponent;
  let fixture: ComponentFixture<EditChannelOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditChannelOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditChannelOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

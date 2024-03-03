import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersOverlayComponent } from './members-overlay.component';

describe('MembersOverlayComponent', () => {
  let component: MembersOverlayComponent;
  let fixture: ComponentFixture<MembersOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MembersOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

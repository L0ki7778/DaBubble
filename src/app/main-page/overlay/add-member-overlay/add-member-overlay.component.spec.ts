import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberOverlayComponent } from './add-member-overlay.component';

describe('AddMemberOverlayComponent', () => {
  let component: AddMemberOverlayComponent;
  let fixture: ComponentFixture<AddMemberOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMemberOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

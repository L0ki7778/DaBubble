import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprintPrivacyHeaderComponent } from './imprint-privacy-header.component';

describe('ImprintPrivacyHeaderComponent', () => {
  let component: ImprintPrivacyHeaderComponent;
  let fixture: ComponentFixture<ImprintPrivacyHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImprintPrivacyHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImprintPrivacyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

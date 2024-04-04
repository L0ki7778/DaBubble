import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadWarningComponent } from './upload-warning.component';

describe('UploadWarningComponent', () => {
  let component: UploadWarningComponent;
  let fixture: ComponentFixture<UploadWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadWarningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

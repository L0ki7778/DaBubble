import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceOverlayComponent } from './workspace-overlay.component';

describe('WorkspaceOverlayComponent', () => {
  let component: WorkspaceOverlayComponent;
  let fixture: ComponentFixture<WorkspaceOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

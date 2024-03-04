import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceDropdownComponent } from './workspace-dropdown.component';

describe('WorkspaceDropdownComponent', () => {
  let component: WorkspaceDropdownComponent;
  let fixture: ComponentFixture<WorkspaceDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

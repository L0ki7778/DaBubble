import { Component, inject } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';
import { WorkspaceOverlayComponent } from './workspace-overlay/workspace-overlay.component';
import { CommonModule } from '@angular/common';
import { DropdownMenuComponent } from './dropdown-menu/dropdown-menu.component';
import { AddMemberOverlayComponent } from './add-member-overlay/add-member-overlay.component';
import { ProfileViewComponent } from './profile-view/profile-view.component';
import { BooleanValueService } from '../../services/boolean-value.service';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { UploadWarningComponent } from './upload-warning/upload-warning.component';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [
    WorkspaceOverlayComponent,
    CommonModule,
    DropdownMenuComponent,
    AddMemberOverlayComponent,
    ProfileViewComponent,
    EditProfileComponent,
    MemberProfileComponent,
    UploadWarningComponent
  ],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent {
  overlay = inject(OverlayService);
  booleanService = inject(BooleanValueService);

  workspaceOverlay = this.overlay.workspaceOverlay;
  isDropdownMenuVisible = this.overlay.isDropdownMenuVisible;
  addMemberOverlay = this.overlay.addMemberOverlay;
  MembersOverlay = this.overlay.membersOverlay;
  profileView = this.overlay.profileView;
  editProfileView = this.overlay.editProfileView;
  memberView = this.overlay.memberView;
  warning = this.overlay.warning;
}
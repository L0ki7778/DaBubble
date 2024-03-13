import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatContentComponent } from './chat-content/chat-content.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    CommonModule,
    ChatHeaderComponent,
    ChatContentComponent,
    ChatInputComponent,
    FormsModule,
    EditorModule,
    ReactiveFormsModule],
  templateUrl: './chat-container.component.html',
  styleUrl: './chat-container.component.scss'
})
export class ChatContainerComponent {
  content = "";

  chatForm : FormGroup = new FormGroup({});

  ngOnInit(){
    this.chatForm = new FormGroup({
      message: new FormControl('')
    })
  }


onSubmit(){
console.log(this.chatForm.value)
}


}

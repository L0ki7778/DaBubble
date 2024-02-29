import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { StartPageComponent } from './main-page/start-page/start-page.component';

export const routes: Routes = [
    { path: '', component: StartPageComponent },
    { path: 'main-page', component: MainPageComponent },
];

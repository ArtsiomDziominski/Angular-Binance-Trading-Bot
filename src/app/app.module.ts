import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {MainComponent} from './pages/main/main.component';
import {BlockPriceComponent} from './components/block-price/block-price.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {AppRoutingModule} from "./app-routing.module";
import {RouterLinkWithHref, RouterOutlet} from "@angular/router";
import {ApiBoxComponent} from './components/api-box/api-box.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DialogBoxTakeProfitComponent} from './components/dialog-box-take-profit/dialog-box-take-profit.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { ListTopTokenComponent } from './components/list-top-token/list-top-token.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    BlockPriceComponent,
    NotFoundComponent,
    ApiBoxComponent,
    DialogBoxTakeProfitComponent,
    ListTopTokenComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    RouterLinkWithHref,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {MainComponent} from './pages/main/main.component';
import {BlockPriceComponent} from './components/block-price/block-price.component';
import {NotFoundComponent} from './pages/not-found/not-found.component';
import {AppRoutingModule} from "./app-routing.module";
import {RouterLinkWithHref, RouterOutlet} from "@angular/router";
import { ApiBoxComponent } from './components/api-box/api-box.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    BlockPriceComponent,
    NotFoundComponent,
    ApiBoxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    RouterLinkWithHref,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

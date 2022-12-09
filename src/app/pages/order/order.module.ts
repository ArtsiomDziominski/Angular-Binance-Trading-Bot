import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrderRoutingModule} from './order-routing.module';
import {OrderRowComponent} from "../../components/order-row/order-row.component";
import {OrderComponent} from "./order.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {NewOrderParamsComponent} from "../../components/new-order-params/new-order-params.component";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  declarations: [
    OrderComponent,
    OrderRowComponent,
    NewOrderParamsComponent,
  ],
  imports: [
    CommonModule,
    OrderRoutingModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonModule,
  ]
})
export class OrderModule {
}

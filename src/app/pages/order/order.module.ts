import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrderRoutingModule} from './order-routing.module';
import {OrderRowComponent} from "../../components/order-row/order-row.component";
import {OrderComponent} from "./order.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTabsModule} from "@angular/material/tabs";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";


@NgModule({
  declarations: [
    OrderComponent,
    OrderRowComponent,
  ],
    imports: [
        CommonModule,
        OrderRoutingModule,
        FormsModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatSlideToggleModule,
    ]
})
export class OrderModule {
}

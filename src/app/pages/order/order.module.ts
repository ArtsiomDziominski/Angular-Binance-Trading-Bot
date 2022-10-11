import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OrderRoutingModule} from './order-routing.module';
import {OrderRowComponent} from "../../components/order-row/order-row.component";
import {OrderComponent} from "./order.component";


@NgModule({
  declarations: [
    OrderComponent,
    OrderRowComponent,
  ],
  imports: [
    CommonModule,
    OrderRoutingModule
  ]
})
export class OrderModule {
}

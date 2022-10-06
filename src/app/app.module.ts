import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MainComponent } from './pages/main/main.component';
import { OrderComponent } from './pages/order/order.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { BlockPriceComponent } from './components/block-price/block-price.component';
import { OrderRowComponent } from './components/order-row/order-row.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    OrderComponent,
    StatisticsComponent,
    BlockPriceComponent,
    OrderRowComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

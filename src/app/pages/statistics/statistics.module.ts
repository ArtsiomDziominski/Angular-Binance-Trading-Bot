import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {StatisticsRoutingModule} from './statistics-routing.module';
import {StatisticsComponent} from "./statistics.component";
import {GraphStatisticsComponent} from "../../components/graph-statistics/graph-statistics.component";

@NgModule({
  declarations: [
    StatisticsComponent,
    GraphStatisticsComponent,

  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
  ],
  exports: [
    GraphStatisticsComponent
  ],
})
export class StatisticsModule {
}

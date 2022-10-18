import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MainComponent} from "./pages/main/main.component";
import {RouterModule, Routes} from "@angular/router";
import {NotFoundComponent} from "./pages/not-found/not-found.component";

const routes: Routes = [
  {path: '', component: MainComponent},
  {
    path: 'order',
    loadChildren: () => import('./pages/order/order.module').then(m => m.OrderModule)
  },
  {
    path: 'stat',
    loadChildren: () => import('./pages/statistics/statistics.module').then(m => m.StatisticsModule)
  },
  {
    path: 'set',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule)
  },
  {path: '**', component: NotFoundComponent}
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ]
})
export class AppRoutingModule { }

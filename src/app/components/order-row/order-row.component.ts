import {Component, Input} from '@angular/core';
import {TextChangeService} from "../../services/text-change.service";
import {OrderService} from "../../services/order/order.service";

@Component({
  selector: 'app-order-row',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss']
})
export class OrderRowComponent {
  @Input()
  public symbol!: string;
  @Input()
  public markPrice!: string|number;
  @Input()
  public entryPrice!: string|number;
  @Input()
  public liquidationPrice!: string|number;
  @Input()
  public amount!: string;
  @Input()
  public pnl!: string|number;

  constructor(public textChangeService:TextChangeService, public orderService: OrderService) {
  }
  ngOnInit(){
    this.markPrice = this.textChangeService.editToFixed2(this.markPrice);
    this.entryPrice = this.textChangeService.editToFixed2(this.entryPrice);
    this.liquidationPrice = this.textChangeService.editToFixed2(this.liquidationPrice);
    this.pnl = this.textChangeService.editToFixed2(this.pnl);
    this.markPrice = this.textChangeService.editToFixed2(this.markPrice);
  }
}

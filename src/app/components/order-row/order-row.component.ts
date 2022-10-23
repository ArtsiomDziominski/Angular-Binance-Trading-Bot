import {Component, Input} from '@angular/core';
import {TextChangeService} from "../../services/text-change.service";
import {OrderService} from "../../services/order/order.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogBoxTakeProfitComponent} from "../dialog-box-take-profit/dialog-box-take-profit.component";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {DIALOG_BOX_PROFIT_WIDTH_260_PX} from "../../const/const";

@Component({
  selector: 'app-order-row',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss']
})
export class OrderRowComponent {
  @Input()
  public symbol!: string;
  @Input()
  public markPrice!: string | number;
  @Input()
  public entryPrice!: string | number;
  @Input()
  public liquidationPrice!: string | number;
  @Input()
  public amount!: string;
  @Input()
  public pnlToken!: string | number;

  public profit!: number;

  constructor(public textChangeService: TextChangeService, public orderService: OrderService,
              public dialog: MatDialog, private functionsOrderService:FunctionsOrderService) {
  }

  ngOnInit() {
    this.markPrice = this.textChangeService.editToFixed2(this.markPrice);
    this.entryPrice = this.textChangeService.editToFixed2(this.entryPrice);
    this.liquidationPrice = this.textChangeService.editToFixed2(this.liquidationPrice);
    this.pnlToken = this.textChangeService.editToFixed2(this.pnlToken);
    this.markPrice = this.textChangeService.editToFixed2(this.markPrice);
  }

  public openDialogTakeProfit(): void {
    const dialogRef = this.dialog.open(DialogBoxTakeProfitComponent, {
      width: DIALOG_BOX_PROFIT_WIDTH_260_PX,
      data: {symbol: this.symbol, profit: this.profit},
    });

    dialogRef.afterClosed().subscribe(result => {
      const amount: number = Number(this.amount)
      this.functionsOrderService.popUpInfo(`${this.symbol} ${result}`);
      this.orderService.newOrder(this.symbol, 'SELL', amount, result)
        .subscribe();
    });
  }
}

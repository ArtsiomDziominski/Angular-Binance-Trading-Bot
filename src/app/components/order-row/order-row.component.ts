import {Component, Input, OnInit} from '@angular/core';
import {TextChangeService} from "../../services/text-change.service";
import {OrderService} from "../../services/order/order.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogBoxTakeProfitComponent} from "../dialog-box-take-profit/dialog-box-take-profit.component";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {DIALOG_BOX_PROFIT_WIDTH_260_PX} from "../../const/const";
import {filter, switchMap, take, tap} from "rxjs";
import {INewOrderParams} from "../../interface/order/new-order";

@Component({
  selector: 'app-order-row',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss']
})
export class OrderRowComponent implements OnInit {
  @Input()
  public symbol!: string;
  @Input()
  public markPrice!: string | number;
  @Input()
  public entryPrice!: string | number;
  @Input()
  public liquidationPrice!: string | number;
  @Input()
  public amount!: string | number;
  @Input()
  public pnlToken!: string | number;

  public profit!: number;

  constructor(public textChangeService: TextChangeService, public orderService: OrderService,
              public dialog: MatDialog, private functionsOrderService: FunctionsOrderService) {
  }

  public ngOnInit(): void {
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

    const newOrderParams: INewOrderParams = {
      symbol: this.symbol,
      side: 'SELL',
      quantityToken: Number(this.amount),
      price: 0,
      distanceToken: 0,
      quantityOrders: 0,
    };

    dialogRef.afterClosed()
      .pipe(
        take(1),
        filter(result => !!result),
        tap(profitPrice => newOrderParams.price = profitPrice),
        switchMap(() => this.orderService.newOrder(newOrderParams))
      )
      .subscribe(res => {
        const result = JSON.parse(<string>res);
        this.functionsOrderService.popUpInfo(`${result.side} ${result.symbol} amount: ${result.origQty} price: ${result.price}`);
      })
  }
}

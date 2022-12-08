import {Component, OnDestroy, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";
import {OrderService} from "../../services/order/order.service";
import {interval, Subscription, take} from "rxjs";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {IApiKey} from "../../interface/api-key";
import {NEW_ORDER, NO_CONNECTION} from "../../const/message-pop-up-info";
import {IOpenOrder} from "../../interface/order/open-order";
import {IParamsOrder} from "../../interface/order/params-order";
import {INTERVAL_NEW_ORDER} from "../../const/http-request";
import {IMsgServer} from "../../interface/msg-server";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  public allCurrentToken: IOpenOrder[] = [];
  public apiKey: IApiKey | undefined;
  public isLoader: boolean = false;
  private intervalRepeatCurrentOpenOrder!: Subscription;
  private intervalNewOrderSequentially?: Subscription;
  private priceCommaNumbers?:number;


  constructor(
    private localStorageService: LocalStorageService,
    public orderService: OrderService,
    public functionsOrderService: FunctionsOrderService,
  ) {
  }

  public ngOnInit(): void {
    this.setAPIkey();
    this.getCurrentOpenOrder();
    this.repeatGetCurrentOpenOrder()
    this.functionsOrderService.filterPriceTokenNumberAfterComma();
  }

  public ngOnDestroy(): void {
    this.intervalRepeatCurrentOpenOrder.unsubscribe();
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public async newOrder(paramsNewOrder: IParamsOrder): Promise<void> {
    const symbolToken:string = paramsNewOrder.symbol;
    const side:string = paramsNewOrder.side;
    const quantityToken:number = paramsNewOrder.quantity;
    const priceToken:number = paramsNewOrder.price;
    const quantityOrders:number = paramsNewOrder.quantityOrders;
    const distanceToken:number = paramsNewOrder.distanceToken;
    this.priceCommaNumbers = paramsNewOrder.priceCommaNumbers;

    if (paramsNewOrder.price === null || undefined) {
      paramsNewOrder.price = 0;
    }
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    await this.newOrdersSequentially(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
  }

  public async newOrdersSequentially(symbolToken: string, side: string, quantityToken: number, priceToken: number, quantityOrders: number, distanceToken: number) {
    let intervalAmount: number = 0;
    let quantityTokenSum: number = 0;
    let quantityTokenStart: number = quantityToken;

    this.intervalNewOrderSequentially = interval(INTERVAL_NEW_ORDER)
      .subscribe({
        next: async () => {
          await this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
            .pipe(take(1))
            .subscribe(
              () => this.functionsOrderService.popUpInfo(`Buy ${symbolToken} amounts=${quantityToken}, price=${priceToken}`),
              (value: string) => this.catchErrorNewOrder(value));

          quantityTokenSum += quantityToken
          priceToken = await this.functionsOrderService.calculationPrice(symbolToken, priceToken, distanceToken, this.priceCommaNumbers);
          quantityToken = this.functionsOrderService.calculationQuantityToken(quantityToken, quantityTokenStart);

          intervalAmount = this.endNewOrdersSequentially(intervalAmount, quantityOrders, symbolToken, side)
        }
      })
  }

  public repeatGetCurrentOpenOrder(): void {
    this.intervalRepeatCurrentOpenOrder = interval(3000)
      .subscribe({
        next: () => {
          this.getCurrentOpenOrder().then((allCurrentToken: IOpenOrder[]) => {
            if (this.functionsOrderService.isToggleRepeatOrder) {
              this.activeToggleRepeatOrder(allCurrentToken);
            }
            this.functionsOrderService.oldActiveCurrentNameToken = [];
            allCurrentToken.forEach((v) => this.functionsOrderService.oldActiveCurrentNameToken.push(v.symbol));
          })
        }
      });
  }

  public async getCurrentOpenOrder(): Promise<IOpenOrder[]> {
    await this.orderService.getCurrentOpenOrder()
      .pipe(take(1))
      .subscribe(
        (value: IOpenOrder[]) => {
          this.allCurrentToken = value.filter((v: IOpenOrder) => v.positionAmt > 0) || undefined;
          value.forEach((v: IOpenOrder) => this.functionsOrderService.symbolAutocomplete.push(v.symbol))
          this.isLoader = true;
        },
        () => {
          this.isLoader = false;
          this.functionsOrderService.popUpInfo(NO_CONNECTION)
        })
    return this.allCurrentToken
  }

  public activeToggleRepeatOrder(allCurrentToken: IOpenOrder[]) {
    console.log('true')
    let activeCurrentNameToken: string[] = [];
    allCurrentToken.forEach((currentToken: IOpenOrder) => activeCurrentNameToken.push(currentToken.symbol));
    if (this.functionsOrderService.oldActiveCurrentNameToken.length > activeCurrentNameToken.length) {
      const symbolsPendingOrder = this.functionsOrderService.oldActiveCurrentNameToken.filter(value => value !== this.functionsOrderService.searchSymbolNotActive(value, activeCurrentNameToken));
      this.orderService.cancelOpenOrders(symbolsPendingOrder[0])

      setTimeout(() => {
        symbolsPendingOrder.forEach((symbolToken: string) => {
          const paramOrder: IParamsOrder = JSON.parse(this.localStorageService.getLocalStorage(symbolToken) || '[]');
          this.newOrder(paramOrder);
        })
      }, 3000)
    }
  }

  public endNewOrdersSequentially(intervalAmount: number, quantityOrders: number, symbolToken: string, side: string) {
    intervalAmount++;
    if (intervalAmount >= quantityOrders) {
      this.functionsOrderService.popUpInfo(`${side} ${symbolToken}`);
      this.intervalNewOrderSequentially?.unsubscribe();
    }
    return intervalAmount;
  }

  public catchErrorNewOrder(value: string) {
    const errorMsg: IMsgServer = JSON.parse(value)
    if (errorMsg.code !== undefined) {
      this.functionsOrderService.popUpInfo(errorMsg.msg);
      this.intervalNewOrderSequentially?.unsubscribe();
    }
  }

  public onOpen($event: any) {
    this.newOrder($event);
  }
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";
import {OrderService} from "../../services/order/order.service";
import {interval, Subscription, take} from "rxjs";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {IApiKey} from "../../interface/api-key";
import {NEW_ORDER, NO_CONNECTION} from "../../const/message-pop-up-info";
import {IOpenOrder} from "../../interface/order/open-order";
import {INTERVAL_NEW_ORDER} from "../../const/http-request";
import {IMsgServer} from "../../interface/msg-server";
import {INewOrderParams} from "../../interface/order/new-order";

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
  private priceCommaNumbers?: number;


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

  public async newOrder(newOrderParams: INewOrderParams): Promise<void> {
    this.priceCommaNumbers = newOrderParams.priceCommaNumbers;

    if (newOrderParams.price === null || undefined) {
      newOrderParams.price = 0;
    }
    this.functionsOrderService.saveParamOrder(newOrderParams);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    await this.newOrdersSequentially(newOrderParams);
  }

  public async newOrdersSequentially(newOrderParams: INewOrderParams) {
    let intervalAmount: number = 0;
    let quantityTokenSum: number = 0;
    const quantityTokenStart: number = newOrderParams.quantityToken;

    this.intervalNewOrderSequentially = interval(INTERVAL_NEW_ORDER)
      .subscribe({
        next: async () => {
          await this.orderService.newOrder(newOrderParams)
            .pipe(take(1))
            .subscribe(
              () => this.functionsOrderService.popUpInfo(`Buy ${newOrderParams.symbol} amounts=${newOrderParams.quantityToken}, price=${newOrderParams.price}`),
              (value: string) => this.catchErrorNewOrder(value));

          quantityTokenSum += newOrderParams.quantityToken
          newOrderParams.price = await this.functionsOrderService.calculationPrice(newOrderParams);
          newOrderParams.quantityToken = this.functionsOrderService.calculationQuantityToken(newOrderParams, quantityTokenStart);

          intervalAmount = this.endNewOrdersSequentially(intervalAmount,newOrderParams)
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
          const paramOrder: INewOrderParams = JSON.parse(this.localStorageService.getLocalStorage(symbolToken) || '[]');
          this.newOrder(paramOrder);
        })
      }, 3000)
    }
  }

  public endNewOrdersSequentially(intervalAmount: number, newOrderParams:INewOrderParams) {
    intervalAmount++;
    if (intervalAmount >= newOrderParams.quantityOrders) {
      this.functionsOrderService.popUpInfo(`${newOrderParams.side} ${newOrderParams.symbol}`);
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

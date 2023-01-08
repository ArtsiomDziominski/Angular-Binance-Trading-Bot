import {Component, OnDestroy, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {OrderService} from "../../services/order/order.service";
import {interval, Subscription, switchMap, take} from "rxjs";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {CHECK_API_KEY, NEW_ORDER, NO_CONNECTION} from "../../const/message-pop-up-info";
import {IOpenOrder} from "../../interface/order/open-order";
import {INTERVAL_NEW_ORDER} from "../../const/http-request";
import {IMsgServer} from "../../interface/msg-server";
import {MainCommonService} from "../../services/main-common.service";
import {IInfoOrderCreate, INewOrderParams} from "../../interface/order/new-order";
import {STOP_CHECK_CURRENT_OPEN_ORDER} from "../../const/const";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  public allCurrentToken: IOpenOrder[] = [];
  public isLoader: boolean = false;
  public isCheckApi: boolean = false;
  private intervalRepeatCurrentOpenOrder!: Subscription;
  private intervalNewOrderSequentially?: Subscription;
  public ordersPlaced: boolean = false;


  constructor(
    private localStorageService: LocalStorageService,
    public orderService: OrderService,
    public functionsOrderService: FunctionsOrderService,
    private mainCommonService: MainCommonService
  ) {
  }

  public ngOnInit(): void {
    this.mainCommonService.setAPIkey();
    if (this.mainCommonService.apiKey) {
      this.getCurrentOpenOrder();
      this.repeatGetCurrentOpenOrder();
      this.functionsOrderService.filterPriceTokenNumberAfterComma();
    } else {
      this.isLoader = true;
      this.functionsOrderService.popUpInfo(CHECK_API_KEY);
      this.isCheckApi = true;
    }
  }

  public ngOnDestroy(): void {
    if (this.intervalRepeatCurrentOpenOrder) this.intervalRepeatCurrentOpenOrder.unsubscribe();
  }

  public async newOrder(newOrderParams: INewOrderParams): Promise<void> {
    newOrderParams.price = newOrderParams.price === null || undefined ? 0 : newOrderParams.price;
    newOrderParams.priceCommaNumbers = newOrderParams.priceCommaNumbers === 0 ?
      this.functionsOrderService.addNumberAfterCommaToNewOrderParams(newOrderParams.symbol) :
      newOrderParams.priceCommaNumbers;
    this.functionsOrderService.saveParamOrder(newOrderParams);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    await this.newOrdersSequentially(newOrderParams);
  }

  public async newOrdersSequentially(newOrderParams: INewOrderParams) {
    this.ordersPlaced = true;
    const newOrderParamsSequentially = {
      intervalAmount: 0,
      quantityTokenSum: 0,
      quantityTokenStart: newOrderParams.quantityToken,
      price: newOrderParams.price,
      currentQuantityToken: 0
    }

    this.intervalNewOrderSequentially = interval(INTERVAL_NEW_ORDER)
      .pipe(switchMap(() => this.orderService.newOrder(newOrderParams).pipe(take(1))))
      .subscribe({
        next: async (result: string) => {
          const infoOrderCreate: IInfoOrderCreate = JSON.parse(result);
          if (this.functionsOrderService.checkError(result)) {
            this.functionsOrderService.popUpInfo(<string>infoOrderCreate.msg);
            this.intervalNewOrderSequentially?.unsubscribe();
            this.ordersPlaced = false;
          } else {
            newOrderParamsSequentially.quantityTokenSum += newOrderParamsSequentially.quantityTokenStart;
            newOrderParams.price = await this.functionsOrderService.calculationPrice(newOrderParams);
            newOrderParamsSequentially.currentQuantityToken = this.functionsOrderService.calculationQuantityToken(newOrderParams, newOrderParamsSequentially.quantityTokenStart);
            await this.functionsOrderService.popUpInfo(`${infoOrderCreate.side} ${infoOrderCreate.symbol} amounts=${infoOrderCreate.origQty}, price=${infoOrderCreate.price}`);
            newOrderParamsSequentially.intervalAmount > STOP_CHECK_CURRENT_OPEN_ORDER ? this.intervalRepeatCurrentOpenOrder?.unsubscribe() : null;
            newOrderParamsSequentially.intervalAmount = this.endNewOrdersSequentially(newOrderParamsSequentially.intervalAmount, newOrderParams);
          }
        },
        error: (value: string) => this.catchErrorNewOrder(value)
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

  public endNewOrdersSequentially(intervalAmount: number, newOrderParams: INewOrderParams) {
    intervalAmount++;
    if (intervalAmount >= newOrderParams.quantityOrders) {
      this.intervalNewOrderSequentially?.unsubscribe();
      this.repeatGetCurrentOpenOrder();
      this.ordersPlaced = false;
      this.orderService.checkAndDeleteDuplicateOrders(newOrderParams.symbol);
    }
    return intervalAmount;
  }

  public catchErrorNewOrder(value: string) {
    const errorMsg: IMsgServer = JSON.parse(value)
    this.intervalNewOrderSequentially?.unsubscribe();
    if (errorMsg.code !== undefined) {
      this.functionsOrderService.popUpInfo(errorMsg.msg);
    }
    this.ordersPlaced = false;
  }

  public newOrderParamsEvent($event: INewOrderParams) {
    this.newOrder($event);
  }

  public cancelCreationNewOrders() {
    this.intervalNewOrderSequentially?.unsubscribe()
  }
}

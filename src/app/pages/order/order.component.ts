import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY, REPEAT_ORDER} from "../../const/const";
import {OrderService} from "../../services/order/order.service";
import {map, Observable, startWith, take} from "rxjs";
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {ThemePalette} from "@angular/material/core";
import {IParamsOrder} from "../../interface/params-order";
import {IApiKey} from "../../interface/api-key";
import {NEW_ORDER} from "../../const/message-pop-up-info";
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";
import {IOpenOrder} from "../../interface/open-order";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  public allCurrentToken: IOpenOrder[] | undefined = [];
  public apiKey: IApiKey | undefined;
  public isInputPriceLimit: boolean = false;
  public isInputNumbersComma: boolean = false;
  public isLoader: boolean = false;
  public colorSlideToggle: ThemePalette = 'primary';
  public isToggleRepeatOrder: boolean = true;
  public oldActiveCurrentToken: string[] = [];

  public symbolToken: string = '';
  public quantityToken: number = 0;
  public priceToken: number = 0;
  public quantityOrders: number = 0;
  public distanceToken: number = 0;
  public priceCommaNumbers: number = 0;

  public newOrderFormGroup = new FormGroup(
    {
      priceControl: new FormControl('', [Validators.minLength(1)]),
      quantityTokenControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      quantityOrdersControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      distanceTokenControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      priceCommaNumbersControl: new FormControl('', [Validators.minLength(1)]),
    })
  public symbolControl = new FormControl(this.symbolToken, [Validators.required, Validators.minLength(7)]);
  public symbolAutocomplete: string[] = [];
  public symbolAutocompleteFiltered?: Observable<string[]>;
  private setIntervalRepeatCurrentOpenOrder!: number ;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    public orderService: OrderService,
    public functionsOrderService: FunctionsOrderService,
  ) {
  }

  public ngOnInit(): void {
    this.setAPIkey();
    this.getCurrentOpenOrder();
    this.autocompleteFiltered();
    this.getValueNewOrderFormGroup();
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
    this.functionsOrderService.filterPriceTokenNumberAfterComma();
    this.isToggleRepeatOrder = JSON.parse(<string>this.localStorageService.getLocalStorage(REPEAT_ORDER));
  }

  public ngOnDestroy(): void {
    clearInterval(this.setIntervalRepeatCurrentOpenOrder);
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public repeatGetCurrentOpenOrder(): void {
    this.setIntervalRepeatCurrentOpenOrder = window.setInterval(() => {
      this.orderService.getCurrentOpenOrder()
        .pipe(take(1))
        .subscribe((value: IOpenOrder[]) => {
          this.allCurrentToken = value.filter((v: IOpenOrder) => v.positionAmt > 0);
          if (this.isToggleRepeatOrder) {
            this.activeToggleRepeatOrder();
          }
          this.oldActiveCurrentToken = [];
          this.allCurrentToken!.forEach((v) => this.oldActiveCurrentToken.push(v.symbol));
        });
    }, 3000)
  }

  public activeToggleRepeatOrder() {
    let activeCurrentToken: string[] = [];
    this.allCurrentToken!.forEach((v) => activeCurrentToken.push(v.symbol))
    if (this.oldActiveCurrentToken.length > activeCurrentToken.length) {
      const symbolsPendingOrder = this.oldActiveCurrentToken.filter(value => value !== this.functionsOrderService.searchSymbolNotActive(value, activeCurrentToken));
      this.orderService.cancelOpenOrders(symbolsPendingOrder[0])

      setTimeout(() => {
        symbolsPendingOrder.forEach((symbolToken: string) => {
          const paramOrder: IParamsOrder = JSON.parse(this.localStorageService.getLocalStorage(symbolToken) || '[]');
          this.newOrder(symbolToken, paramOrder.side, paramOrder.quantity, paramOrder.price, paramOrder.quantityOrders, paramOrder.distanceToken);
        })
      }, 3000)
    }
  }

  public getCurrentOpenOrder(): void {
    this.orderService.getCurrentOpenOrder()
      .pipe(take(1))
      .subscribe((value: IOpenOrder[]) => {
        this.allCurrentToken = value.filter((v: IOpenOrder) => v.positionAmt > 0) || undefined;
        value.forEach((v: IOpenOrder) => this.symbolAutocomplete.push(v.symbol))
        this.isLoader = true;
      });
    this.repeatGetCurrentOpenOrder();
  }

  public async newOrder(symbolToken: string, side: string, quantityToken: number = 0, priceToken: number = 0, quantityOrders: number = 0, distanceToken: number = 0): Promise<void> {
    if (priceToken === null || undefined) {
      priceToken = 0;
    }
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    await this.newOrdersSequentially(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
  }

  public async newOrdersSequentially(symbolToken: string, side: string, quantityToken: number, priceToken: number, quantityOrders: number, distanceToken: number) {
    let setIntervalAmount: number = 0;
    let quantityTokenSum: number = 0;
    let quantityTokenStart: number = quantityToken;

    let setIntervalNewOrder = setInterval(async () => {
      this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
        .pipe(take(1))
        .subscribe((value: any) => {
          value = JSON.parse(value)
          if (value.code !== undefined) {
            this.functionsOrderService.popUpInfo(value.msg);
            clearInterval(setIntervalNewOrder);
          }
        });
      quantityTokenSum += quantityToken
      priceToken = await this.functionsOrderService.calculationPrice(symbolToken, priceToken, distanceToken, this.priceCommaNumbers);
      quantityToken = this.functionsOrderService.calculationQuantityToken(quantityToken, quantityTokenStart);

      setIntervalAmount++;
      if (setIntervalAmount >= quantityOrders) {
        this.functionsOrderService.popUpInfo(`${side} ${symbolToken}`);
        clearInterval(setIntervalNewOrder);
      }
    }, 1500);
  }

  private autocompleteFiltered(): void {
    this.symbolAutocompleteFiltered = this.symbolControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value || ''.toLowerCase();
        return this.symbolAutocomplete.filter(option => option.toLowerCase().includes(filterValue));
      }),
    );
  }

  public toggleRepeatOrder(): void {
    this.isToggleRepeatOrder = !this.isToggleRepeatOrder;
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
    this.localStorageService.setLocalStorage(REPEAT_ORDER, this.isToggleRepeatOrder);
  }

  public getValueNewOrderFormGroup(): void {
    this.newOrderFormGroup.valueChanges
      .pipe(take(1))
      .subscribe(paramsNewOrder => {
      this.priceToken = Number(paramsNewOrder.priceControl || 0);
      this.quantityToken = Number(paramsNewOrder.quantityTokenControl || 0);
      this.quantityOrders = Number(paramsNewOrder.quantityOrdersControl || 0);
      this.distanceToken = Number(paramsNewOrder.distanceTokenControl || 0);
      this.priceCommaNumbers = Number(paramsNewOrder.priceCommaNumbersControl || 0);
    })
    this.symbolControl.valueChanges
      .pipe(take(1))
      .subscribe((symbolControlValue: string | null) => {
      this.symbolToken = symbolControlValue || ''
      this.isInputNumbersComma = true;
      this.functionsOrderService.getListSymbolNumberComma().forEach((value: ISymbolNumberAfterComma) => {
        if (value.symbol == this.symbolToken) {
          this.isInputNumbersComma = false;
        }
      });
    })
  }
}

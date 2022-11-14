import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ICurrenTokens} from "../../interface/currentToken";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";
import {OrderService} from "../../services/order/order.service";
import {map, Observable, startWith} from "rxjs";
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {ThemePalette} from "@angular/material/core";
import {IParamsOrder} from "../../interface/params-order";
import {IApiKey} from "../../interface/api-key";
import {NEW_ORDER} from "../../const/message-pop-up-info";
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  public allCurrentToken: ICurrenTokens[] = [];
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

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    public orderService: OrderService,
    public functionsOrderService: FunctionsOrderService,
  ) {
  }

  ngOnInit() {
    this.setAPIkey();
    this.getCurrentOpenOrder();
    this.autocompleteFiltered();
    this.getValueNewOrderFormGroup();
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
    this.functionsOrderService.filterPriceTokenNumberAfterComma();
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public getCurrentOpenOrder(): void {
    this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
      this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);
      value.forEach((v: any) => this.symbolAutocomplete.push(v.symbol))
      this.isLoader = true;
    });
    setInterval(() => {
      let activeCurrentToken: string[] = [];
      this.orderService.getCurrentOpenOrder()
        .subscribe((value: any) => {
          this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);

          if (this.functionsOrderService.toggleRepeatOrder) {
            this.allCurrentToken.forEach((v) => activeCurrentToken.push(v.symbol))
            if (this.oldActiveCurrentToken.length > activeCurrentToken.length) {
              const symbolsPendingOrder = this.oldActiveCurrentToken.filter(value => value !== this.functionsOrderService.searchSymbolNotActive(value, activeCurrentToken));
              this.oldActiveCurrentToken.forEach(symbol => this.orderService.cancelOpenOrders(symbol));
              setTimeout(() => {
                symbolsPendingOrder.forEach((symbolToken: string) => {
                  const paramOrder: IParamsOrder = JSON.parse(this.localStorageService.getLocalStorage(symbolToken) || '[]');
                  this.newOrder(symbolToken, paramOrder.side, paramOrder.quantity, paramOrder.price, paramOrder.quantityOrders, paramOrder.distanceToken);
                })
              }, 3000)
            }
          }
          this.oldActiveCurrentToken = []
          this.allCurrentToken.forEach((v) => this.oldActiveCurrentToken.push(v.symbol))
        });
    }, 3000)
  }

  public newOrder(symbolToken: string, side: string, quantityToken: number = 0, priceToken: number = 0, quantityOrders: number = 0, distanceToken: number = 0) {
    let setIntervalAmount: number = 0;
    if (priceToken === null || undefined) {
      priceToken = 0;
    }
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    let setIntervalNewOrder = setInterval(() => {
      this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
        .subscribe((value: any) => {
          value = JSON.parse(value)
          if (value.code !== undefined) {
            this.functionsOrderService.popUpInfo(value.msg);
            clearInterval(setIntervalNewOrder);
          }
        });
      priceToken = this.functionsOrderService.calculationPrice(symbolToken, priceToken, distanceToken, this.priceCommaNumbers);
      quantityToken = this.functionsOrderService.calculationQuantityToken(quantityToken);
      setIntervalAmount++;
      if (setIntervalAmount <= quantityOrders) {
        this.functionsOrderService.popUpInfo(`${side} ${symbolToken}`);
        clearInterval(setIntervalNewOrder);
      }
    }, 1500)
    this.symbolToken = '';
  }

  private autocompleteFiltered() {
    this.symbolAutocompleteFiltered = this.symbolControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value || ''.toLowerCase();
        return this.symbolAutocomplete.filter(option => option.toLowerCase().includes(filterValue));
      }),
    );
  }

  public toggleRepeatOrder() {
    this.isToggleRepeatOrder = !this.isToggleRepeatOrder;
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
  }

  public getValueNewOrderFormGroup() {
    this.newOrderFormGroup.valueChanges.subscribe(paramsNewOrder => {
      this.priceToken = Number(paramsNewOrder.priceControl || 0);
      this.quantityToken = Number(paramsNewOrder.quantityTokenControl || 0);
      this.quantityOrders = Number(paramsNewOrder.quantityOrdersControl || 0);
      this.distanceToken = Number(paramsNewOrder.distanceTokenControl || 0);
      this.priceCommaNumbers = Number(paramsNewOrder.priceCommaNumbersControl || 0);
    })
    this.symbolControl.valueChanges.subscribe((symbolControlValue: string | null) => {
      this.symbolToken = symbolControlValue || ''
      this.isInputNumbersComma = true;
      this.functionsOrderService.getListSymbolNumberComma().forEach((value:ISymbolNumberAfterComma) => {
        if (value.symbol == this.symbolToken) {
          this.isInputNumbersComma = false;
        }
      });
    })
  }
}

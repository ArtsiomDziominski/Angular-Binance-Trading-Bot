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

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  public allCurrentToken: ICurrenTokens[] = [];
  public apiKey: { akey: string, skey: string } | undefined;
  public isInputPriceLimit: boolean = false;
  public colorSlideToggle: ThemePalette = 'primary';
  public isToggleRepeatOrder: boolean = true;
  public oldActiveCurrentToken: string[] = [];

  public symbolToken: string = '';
  public quantityToken: number | undefined;
  public priceToken: number | undefined;
  public quantityOrders: number | undefined;
  public distanceToken: number | undefined;

  public newOrderFormGroup!: FormGroup;
  public symbolControl = new FormControl('');
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
    this.autocompleteFiltered()
    this.newOrderFormGroup = new FormGroup(
      {
        symbolToken: new FormControl('', [Validators.required, Validators.minLength(7)]),
        quantityToken: new FormControl('', [Validators.required, Validators.minLength(1)]),
        quantityOrders: new FormControl('', [Validators.required, Validators.minLength(1)]),
        distanceToken: new FormControl('', [Validators.required, Validators.minLength(1)]),
      })
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public getCurrentOpenOrder(): void {
    this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
      this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);
      value.forEach((v: any) => this.symbolAutocomplete.push(v.symbol))
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
    let quantityTokenStart: number = quantityToken;
    if (priceToken === null || undefined) {
      priceToken = 0;
    }
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);

    let setIntervalNewOrder = setInterval(() => {
      this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
        .subscribe();
      priceToken = this.functionsOrderService.getCurrentPriceToken(symbolToken, priceToken);
      quantityToken += quantityTokenStart
      priceToken = priceToken - distanceToken;
      setIntervalAmount++;
      if (setIntervalAmount === quantityOrders) {
        this.functionsOrderService.popUpInfo(`${side} ${symbolToken}`);
        clearInterval(setIntervalNewOrder);
      }
    }, 1000)
    this.symbolToken = '';
  }

  private autocompleteFiltered() {
    this.symbolAutocompleteFiltered = this.symbolControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.symbolAutocomplete.filter(option => option.toLowerCase().includes(filterValue));
  }

  public toggleRepeatOrder() {
    this.isToggleRepeatOrder = !this.isToggleRepeatOrder;
    this.functionsOrderService.setToggleRepeatOrder(this.isToggleRepeatOrder);
  }

}

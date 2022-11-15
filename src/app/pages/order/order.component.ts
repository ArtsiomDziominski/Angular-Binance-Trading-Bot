import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ICurrenTokens} from "../../interface/currentToken";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY, REPEAT_ORDER} from "../../const/const";
import {OrderService} from "../../services/order/order.service";
import {map, Observable, startWith, Subscription} from "rxjs";
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
export class OrderComponent implements OnInit, OnDestroy {
  public allCurrentToken: ICurrenTokens[] | undefined = [];
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

  public getCurrentOpenOrder$!: Subscription;
  public newOrderFormGroup$!: Subscription;
  public currentOpenOrder$!: Subscription;
  public newOrder$!: Subscription;
  public symbolControl$!: Subscription;

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
    this.isToggleRepeatOrder = JSON.parse(<string>this.localStorageService.getLocalStorage(REPEAT_ORDER));
  }

  ngOnDestroy() {
    this.getCurrentOpenOrder$.unsubscribe()
    this.newOrderFormGroup$.unsubscribe()
    this.currentOpenOrder$.unsubscribe()
    this.newOrder$.unsubscribe()
    this.symbolControl$.unsubscribe()
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public repeatGetCurrentOpenOrder() {
    setInterval(() => {
      let activeCurrentToken: string[] = [];
      try {
        this.getCurrentOpenOrder$ = this.orderService.getCurrentOpenOrder()
          .subscribe((value: any) => {
            this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);

            if (this.isToggleRepeatOrder) {
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
            this.oldActiveCurrentToken = []
            this.allCurrentToken!.forEach((v) => this.oldActiveCurrentToken.push(v.symbol))
          });
      } catch (e) {
        console.log('Error getCurrentOpenOrder')
      }

    }, 3000)
  }

  public getCurrentOpenOrder(): void {
    this.currentOpenOrder$ = this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
      this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0) || undefined;
      value.forEach((v: any) => this.symbolAutocomplete.push(v.symbol))
      this.isLoader = true;
    });
    this.repeatGetCurrentOpenOrder();
  }

  public async newOrder(symbolToken: string, side: string, quantityToken: number = 0, priceToken: number = 0, quantityOrders: number = 0, distanceToken: number = 0) {
    let setIntervalAmount: number = 0;
    let quantityTokenSumm: number = 0;
    let quantityTokenStart: number = quantityToken;
    if (priceToken === null || undefined) {
      priceToken = 0;
    }
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);
    this.functionsOrderService.popUpInfo(NEW_ORDER);
    let setIntervalNewOrder = setInterval(async () => {
      this.newOrder$ = this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
        .subscribe((value: any) => {
          value = JSON.parse(value)
          if (value.code !== undefined) {
            this.functionsOrderService.popUpInfo(value.msg);
            clearInterval(setIntervalNewOrder);
          }
        });
      quantityTokenSumm += quantityToken
      console.log(quantityTokenSumm)
      priceToken = await this.functionsOrderService.calculationPrice(symbolToken, priceToken, distanceToken, this.priceCommaNumbers);
      quantityToken = this.functionsOrderService.calculationQuantityToken(quantityToken, quantityTokenStart);

      setIntervalAmount++;
      if (setIntervalAmount >= quantityOrders) {
        this.functionsOrderService.popUpInfo(`${side} ${symbolToken}`);
        clearInterval(setIntervalNewOrder);
      }
    }, 1500)
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
    this.localStorageService.setLocalStorage(REPEAT_ORDER, this.isToggleRepeatOrder);
  }

  public getValueNewOrderFormGroup() {
    this.newOrderFormGroup$ = this.newOrderFormGroup.valueChanges.subscribe(paramsNewOrder => {
      this.priceToken = Number(paramsNewOrder.priceControl || 0);
      this.quantityToken = Number(paramsNewOrder.quantityTokenControl || 0);
      this.quantityOrders = Number(paramsNewOrder.quantityOrdersControl || 0);
      this.distanceToken = Number(paramsNewOrder.distanceTokenControl || 0);
      this.priceCommaNumbers = Number(paramsNewOrder.priceCommaNumbersControl || 0);
    })
    this.symbolControl$ = this.symbolControl.valueChanges.subscribe((symbolControlValue: string | null) => {
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

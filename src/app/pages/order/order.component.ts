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

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  public allCurrentToken: ICurrenTokens[] = [];
  public apiKey: { akey: string, skey: string } | undefined;
  public isInfoOrderBox: boolean = false;
  public infoText: string = '';
  public isInputPriceLimit: boolean = false;
  public colorSlideToggle: ThemePalette = 'primary';
  public isToggleRepeatOrder: boolean = true

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
    private functionsOrderService: FunctionsOrderService,
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
      this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
        this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);
      });
    }, 3000)
  }

  // public closeAllCurrentsOrders(symbol: string = 'BNBUSDT'): void {
  //   const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
  //   const signature: string = this.hashFunctions(dataQueryString);
  //   const URL: string = BURL + `/order/closeOpenOrder/${signature}-${dataQueryString}-${this.apiKey!.akey}`
  //   console.log(URL)
  //   this.http.get(URL).subscribe((value: any) => {
  //     console.log(value)
  //   })
  // }

  public newOrder(symbolToken: string, side: string, quantityToken: number = 0, priceToken: number = 0, quantityOrders: number = 0, distanceToken: number = 0) {
    let setIntervalAmount: number = 0;
    let quantityTokenStart: number = quantityToken;
    this.functionsOrderService.saveParamOrder(symbolToken, side, quantityToken, priceToken, quantityOrders, distanceToken);

    let setIntervalNewOrder = setInterval(() => {
      this.orderService.newOrder(symbolToken, side, quantityToken, priceToken)
        .subscribe(
          (value: any) => {
            this.infoText = this.functionsOrderService.getInfoText(value, this.infoText);
            this.isInfoOrderBox = true;
          });
      priceToken = this.functionsOrderService.getCurrentPriceToken(symbolToken, priceToken);
      quantityToken += quantityTokenStart
      priceToken = priceToken - distanceToken;
      setIntervalAmount++;
      if (setIntervalAmount === quantityOrders) {
        setTimeout(() => this.isInfoOrderBox = false, 5000);
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

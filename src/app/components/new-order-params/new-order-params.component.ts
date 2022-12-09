import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {REPEAT_ORDER} from "../../const/const";
import {ThemePalette} from "@angular/material/core";
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {IParamsOrder} from "../../interface/order/params-order";

@Component({
  selector: 'app-new-order-params',
  templateUrl: './new-order-params.component.html',
  styleUrls: ['./new-order-params.component.scss']
})
export class NewOrderParamsComponent implements OnInit {
  @Output() paramsNewOrderEvent: EventEmitter<IParamsOrder> = new EventEmitter();

  public symbolToken: string = '';
  public quantityToken: number = 0;
  public priceToken: number = 0;
  public quantityOrders: number = 0;
  public distanceToken: number = 0;
  public priceCommaNumbers: number = 0;

  public isInputPriceLimit: boolean = false;
  public isInputNumbersComma: boolean = false;
  public isToggleRepeatOrder: boolean = true;

  public colorSlideToggle: ThemePalette = 'primary';

  public symbolAutocompleteFiltered?: Observable<string[]>;

  public symbolControl = new FormControl(this.symbolToken, [Validators.required, Validators.minLength(7)]);

  public newOrderFormGroup = new FormGroup(
    {
      priceControl: new FormControl('', [Validators.minLength(1)]),
      quantityTokenControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      quantityOrdersControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      distanceTokenControl: new FormControl('', [Validators.required, Validators.minLength(1)]),
      priceCommaNumbersControl: new FormControl('', [Validators.minLength(1)]),
    })

  constructor(
    private localStorageService: LocalStorageService,
    public functionsOrderService: FunctionsOrderService,
    private mainBlockPriceService: MainBlockPriceService
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.getValueNewOrderFormGroup();
    this.autocompleteFiltered();
    this.isToggleRepeatOrder = JSON.parse(<string>this.localStorageService.getLocalStorage(REPEAT_ORDER));
    this.functionsOrderService.isToggleRepeatOrder = this.isToggleRepeatOrder;
    this.mainBlockPriceService.getPriceTokenMain().subscribe();
  }

  public getValueNewOrderFormGroup(): void {
    this.newOrderFormGroup.valueChanges
      .subscribe(paramsNewOrder => {
        this.priceToken = Number(paramsNewOrder.priceControl || 0);
        this.quantityToken = Number(paramsNewOrder.quantityTokenControl || 0);
        this.quantityOrders = Number(paramsNewOrder.quantityOrdersControl || 0);
        this.distanceToken = Number(paramsNewOrder.distanceTokenControl || 0);
        this.priceCommaNumbers = Number(paramsNewOrder.priceCommaNumbersControl || 0);
      })
    this.symbolControl.valueChanges
      .subscribe((symbolControlValue: string | null) => {
        this.symbolToken = symbolControlValue?.toUpperCase() || ''
        this.isInputNumbersComma = true;

        this.functionsOrderService.filterPriceTokenNumberAfterComma().forEach((value: ISymbolNumberAfterComma) => {
          if (value.symbol == this.symbolToken) {
            this.isInputNumbersComma = false;
          }
        });
      })
  }

  private autocompleteFiltered(): void {
    this.symbolAutocompleteFiltered = this.symbolControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = value || ''.toLowerCase();
        return this.functionsOrderService.symbolAutocomplete.filter(option => option.toLowerCase().includes(filterValue));
      }),
    );
  }

  public toggleRepeatOrder(): void {
    this.isToggleRepeatOrder = !this.isToggleRepeatOrder;
    this.functionsOrderService.isToggleRepeatOrder = this.isToggleRepeatOrder;
    this.localStorageService.setLocalStorage(REPEAT_ORDER, this.isToggleRepeatOrder);
  }

  public newOrder(side: string) {
    if (this.priceCommaNumbers === 0) {
      this.functionsOrderService.listSymbolNumberComma.forEach(symbolNumberComma => {
        if (this.symbolToken == symbolNumberComma.symbol) {
          this.priceCommaNumbers = symbolNumberComma.numberAfterComma;
        }
      });
    }
    const paramsNewOrder: IParamsOrder = {
      symbol: this.symbolToken,
      side,
      quantity: this.quantityToken,
      price: this.priceToken,
      quantityOrders: this.quantityOrders,
      distanceToken: this.distanceToken,
      priceCommaNumbers: this.priceCommaNumbers
    }
    this.paramsNewOrderEvent.emit(paramsNewOrder);
  }
}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {map, Observable, startWith} from "rxjs";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {FunctionsOrderService} from "../../services/order/functions-order.service";
import {REPEAT_ORDER} from "../../const/const";
import {ThemePalette} from "@angular/material/core";
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {INewOrderParams} from "../../interface/order/new-order";

@Component({
  selector: 'app-new-order-params',
  templateUrl: './new-order-params.component.html',
  styleUrls: ['./new-order-params.component.scss']
})
export class NewOrderParamsComponent implements OnInit {
  @Input() ordersCreated!: boolean;
  @Output() newOrderParamsEvent: EventEmitter<INewOrderParams> = new EventEmitter();
  @Output() cancelCreationNewOrders: EventEmitter<void> = new EventEmitter();

  public newOrderParams: INewOrderParams = this.functionsOrderService.newOrderParams;

  public isInputPriceLimit: boolean = false;
  public isInputNumbersComma: boolean = false;
  public isToggleRepeatOrder: boolean = true;

  public colorSlideToggle: ThemePalette = 'primary';

  public symbolAutocompleteFiltered?: Observable<string[]>;

  public symbolControl = new FormControl(this.newOrderParams.symbol, [Validators.required, Validators.minLength(7)]);

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
        this.newOrderParams.price = Number(paramsNewOrder.priceControl || 0);
        this.newOrderParams.quantityToken = Number(paramsNewOrder.quantityTokenControl || 0);
        this.newOrderParams.quantityOrders = Number(paramsNewOrder.quantityOrdersControl || 0);
        this.newOrderParams.distanceToken = Number(paramsNewOrder.distanceTokenControl || 0);
        this.newOrderParams.priceCommaNumbers = Number(paramsNewOrder.priceCommaNumbersControl || 0);
      })
    this.symbolControl.valueChanges
      .subscribe((symbolControlValue: string | null) => {
        this.newOrderParams.symbol = symbolControlValue?.toUpperCase() || ''
        this.isInputNumbersComma = true;

        this.functionsOrderService.filterPriceTokenNumberAfterComma().forEach((value: ISymbolNumberAfterComma) => {
          if (value.symbol == this.newOrderParams.symbol) {
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
    if (this.ordersCreated) {
      this.cancelCreationNewOrders.emit();
      this.ordersCreated = false;
    } else {
      const newOrderParams: INewOrderParams = {
        symbol: this.newOrderParams.symbol,
        side,
        quantityToken: this.newOrderParams.quantityToken,
        price: this.isInputPriceLimit ? this.newOrderParams.price : 0,
        quantityOrders: this.newOrderParams.quantityOrders,
        distanceToken: this.newOrderParams.distanceToken,
        priceCommaNumbers: this.newOrderParams.priceCommaNumbers
      }
      this.newOrderParamsEvent.emit(newOrderParams);
    }
  }
}

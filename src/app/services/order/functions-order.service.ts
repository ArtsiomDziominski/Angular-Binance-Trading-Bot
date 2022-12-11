import {Injectable} from '@angular/core';
import {MainBlockPriceService} from "../main-block-token-price/main-block-price.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";
import {HTTP_GET_24hr} from "../../const/http-request";
import {IPrice} from "../../interface/price-token";
import {INewOrderParams} from "../../interface/order/new-order";

@Injectable({
  providedIn: 'root'
})
export class FunctionsOrderService {
  public isToggleRepeatOrder: boolean = false;
  listSymbolNumberComma: ISymbolNumberAfterComma[] = [];
  public symbolAutocomplete: string[] = [];
  public oldActiveCurrentNameToken: string[] = [];

  public newOrderParams: INewOrderParams = {
    side: 'BUY',
    symbol: '',
    quantityToken: 0,
    quantityOrders: 0,
    distanceToken: 0,
    priceCommaNumbers: 0,
    price: 0
  }


  constructor(private mainBlockPriceService: MainBlockPriceService, public localStorageService: LocalStorageService,
              private _snackBar: MatSnackBar) {
  }

  public getAllTokens(): Promise<Response> {
    return fetch(HTTP_GET_24hr)
  }

  public async getCurrentPriceToken(symbolToken: string, priceToken: number): Promise<number> {
    let currentToken: any;
    if (priceToken <= 0) {
      await this.getAllTokens()
        .then(res => res.json())
        .then(result => {
          currentToken = result.find((v: any) => v.symbol === symbolToken)
          priceToken = Number(currentToken.lastPrice);
        })
    }
    return priceToken;
  }

  public saveParamOrder(newOrderParams: INewOrderParams): void {
    this.localStorageService.setLocalStorage(newOrderParams.symbol, JSON.stringify(newOrderParams))
  }

  public popUpInfo(msg: string): void {
    const horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    const verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    this._snackBar.open(msg, 'X', {
      horizontalPosition,
      verticalPosition,
      duration: 5000,
    });
  }

  public searchSymbolNotActive(symbol: string, activeCurrentToken: string[]): string {
    let symbolNotActive: string = '';
    for (let i = 0; i < activeCurrentToken.length; i++) {
      if (symbol === activeCurrentToken[i]) {
        symbolNotActive = symbol
      }
    }
    return symbolNotActive;
  }

  public async calculationPrice(newOrderParams: INewOrderParams): Promise<number> {
    if (newOrderParams.priceCommaNumbers === 0) {
      this.listSymbolNumberComma.forEach((v: ISymbolNumberAfterComma) => {
        if (v.symbol === newOrderParams.symbol) {
          newOrderParams.priceCommaNumbers = v.numberAfterComma;
        }
      })
    }
    newOrderParams.price = await this.getCurrentPriceToken(newOrderParams.symbol, newOrderParams.price);
    newOrderParams.price = Number.parseFloat(String(newOrderParams.price))
    newOrderParams.price = Number(newOrderParams.price.toFixed(newOrderParams.priceCommaNumbers))
    newOrderParams.price = newOrderParams.price - newOrderParams.distanceToken;
    return newOrderParams.price;
  }

  public calculationQuantityToken(newOrderParams: INewOrderParams, quantityTokenStart: number): number {
    newOrderParams.quantityToken += quantityTokenStart;
    newOrderParams.quantityToken = Number.parseFloat(String(newOrderParams.quantityToken))
    newOrderParams.quantityToken = Number(newOrderParams.quantityToken.toFixed(newOrderParams.priceCommaNumbers))
    return newOrderParams.quantityToken
  }

  public filterPriceTokenNumberAfterComma(): ISymbolNumberAfterComma[] {
    let symbol: string;
    let numberAfterComma: string;
    this.listSymbolNumberComma = [];

    this.mainBlockPriceService.allPriceTokens.forEach((allOptionsToken: IPrice) => {
      symbol = allOptionsToken.symbol;
      numberAfterComma = allOptionsToken.lastPrice.split('.').pop() || '';
      this.listSymbolNumberComma.push({"symbol": symbol, "numberAfterComma": numberAfterComma.length});
    })
    return this.listSymbolNumberComma;
  }

  public checkError(msgServer: string) {
    const msgServerJson:{code:number|string} = JSON.parse(msgServer);
    return !!msgServerJson.code;
  }
}

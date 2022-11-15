import {Injectable} from '@angular/core';
import {MainBlockPriceService} from "../main-block-token-price/main-block-price.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {IParamsOrder} from "../../interface/params-order";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import {ISymbolNumberAfterComma} from "../../interface/symbol-price-number-after-comma";
import {HTTP_GET_24hr} from "../../const/http-request";

@Injectable({
  providedIn: 'root'
})
export class FunctionsOrderService {
  private isToggleRepeatOrder: boolean = false;
  private listSymbolNumberComma: ISymbolNumberAfterComma[] = [];

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

  public saveParamOrder(symbol: string, side: string, quantity: number, price: number, quantityOrders: number, distanceToken: number): void {
    const paramOrder: IParamsOrder = {
      symbol: symbol,
      side: side,
      quantity: quantity,
      price: price,
      quantityOrders: quantityOrders,
      distanceToken: distanceToken
    }
    this.localStorageService.setLocalStorage(symbol, JSON.stringify(paramOrder))
  }

  public setToggleRepeatOrder(isToggleRepeatOrder: boolean) {
    this.isToggleRepeatOrder = isToggleRepeatOrder;
  }

  public get toggleRepeatOrder(): boolean {
    return this.isToggleRepeatOrder;
  }

  public popUpInfo(msg: string): void {
    const horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    const verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    this._snackBar.open(msg, 'X', {
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
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

  public async calculationPrice(symbolToken: string, priceToken: number, distanceToken: number, priceCommaNumbers: number): Promise<number> {
    if (priceCommaNumbers === 0) {
      this.listSymbolNumberComma.forEach((v: ISymbolNumberAfterComma) => {
        if (v.symbol === symbolToken) {
          priceCommaNumbers = v.numberAfterComma;
        }
      })
    }
    priceToken = await this.getCurrentPriceToken(symbolToken, priceToken);
    priceToken = Number.parseFloat(String(priceToken))
    priceToken = Number(priceToken.toFixed(priceCommaNumbers))
    priceToken = priceToken - distanceToken;
    return priceToken
  }

  public calculationQuantityToken(quantityToken: number, quantityTokenStart: number): number {
    quantityToken += quantityTokenStart;
    quantityToken = Number.parseFloat(String(quantityToken))
    quantityToken = Number(quantityToken.toFixed(3))
    return quantityToken
  }

  public filterPriceTokenNumberAfterComma(): ISymbolNumberAfterComma[] {
    let symbol: string;
    let numberAfterComma: number;
    this.mainBlockPriceService.getAllTokens().forEach((v: any) => {
      symbol = v.symbol;
      numberAfterComma = v.lastPrice.split('.').pop().length
      this.listSymbolNumberComma.push({"symbol": symbol, "numberAfterComma": numberAfterComma});
    })
    return this.listSymbolNumberComma;
  }

  public getListSymbolNumberComma(): ISymbolNumberAfterComma[] {
    return this.listSymbolNumberComma;
  }
}

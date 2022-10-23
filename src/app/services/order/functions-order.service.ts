import {Injectable} from '@angular/core';
import {MainBlockPriceService} from "../main-block-token-price/main-block-price.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {IParamsOrder} from "../../interface/params-order";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class FunctionsOrderService {
  private isToggleRepeatOrder: boolean = false;

  constructor(private mainBlockPriceService: MainBlockPriceService, public localStorageService: LocalStorageService,
              private _snackBar: MatSnackBar) {
  }

  public getCurrentPriceToken(symbolToken: string, priceToken: number): number {
    if (priceToken === 0) {
      do {
        let currentToken: any = this.mainBlockPriceService.getAllTokens().find((v: any) => v.symbol === symbolToken);
        priceToken = Number(currentToken.lastPrice) || 0;
      } while (priceToken == 0)
    }
    return priceToken;
  }

  public saveParamOrder(symbol: string, side: string, quantity: number, price: number, quantityOrders: number, distanceToken: number) {
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

  public popUpInfo(msg: string) {
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
}

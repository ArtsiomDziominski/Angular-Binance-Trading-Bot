import {Injectable} from '@angular/core';
import {MainBlockPriceService} from "../main-block-token-price/main-block-price.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {IParamsOrder} from "../../interface/params-order";

@Injectable({
  providedIn: 'root'
})
export class FunctionsOrderService {
  private isToggleRepeatOrder: boolean = false;

  constructor(private mainBlockPriceService: MainBlockPriceService, public localStorageService: LocalStorageService) {
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

  public getInfoText(value: string, infoText: string) {
    let v = JSON.parse(value)
    if (v.code !== undefined) {
      infoText = v.msg;
    } else {
      infoText = v.symbol;
    }
    return infoText;
  }

  public saveParamOrder(symbol: string, side: string, quantity: number | undefined, price: number, quantityOrders: number, distanceToken: number) {
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
    console.log(this.isToggleRepeatOrder);
  }

  public get toggleRepeatOrder(): boolean {
    return this.isToggleRepeatOrder;
  }
}

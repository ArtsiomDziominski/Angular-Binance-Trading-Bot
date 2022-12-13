import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";
import {API_KEY, MARKET, SELL} from "../../const/const";
import {BURL, DELETE_ALL_ORDERS_SYMBOL, DELETE_ONE_ORDER_SYMBOL, GET_ALL_ORDERS_SYMBOL} from "../../const/http-request";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {filter, Observable, take} from "rxjs";
import {FunctionsOrderService} from "./functions-order.service";
import {IMsgServer} from "../../interface/msg-server";
import {IOpenOrder} from "../../interface/order/open-order";
import {INewOrderParams, IParamSignatureNewOrder} from "../../interface/order/new-order";
import {IApiKey} from "../../interface/api-key";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient
    , private localStorageService: LocalStorageService,
    public functionsOrderService: FunctionsOrderService
  ) {
  }

  public setAPIkey(): IApiKey | undefined {
    return JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public hashFunctions(dataQueryString: string, apiKey: IApiKey | undefined): string {
    return sha256.hmac.create(apiKey!.skey).update(dataQueryString).hex();
  }

  private paramsNewRequest(signature: string, dataQueryString: string, apiKey: string): IParamSignatureNewOrder {
    return {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey
    }
  }

  public newOrder(newOrderParams: INewOrderParams): Observable<string> {
    const symbol = newOrderParams.symbol.trim();
    let dataQueryString: string = newOrderParams.price === 0 ?
      `symbol=${symbol}&side=${newOrderParams.side}&quantity=${newOrderParams.quantityToken}&type=MARKET&timestamp=` + Date.now() :
      `symbol=${symbol}&side=${newOrderParams.side}&quantity=${newOrderParams.quantityToken}&type=LIMIT&price=${newOrderParams.price}&timeInForce=GTC&timestamp=` + Date.now();
    const apiKey: IApiKey | undefined = this.setAPIkey();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + '/new-order/' + JSON.stringify(params);
    console.log(URL)
    return this.http.get<string>(URL, {responseType: 'text' as 'json'});
  }

  public marketOrder(symbol: string, side: string, quantity: string | number, type: string): void {
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=${type}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + '/market-order/' + JSON.stringify(params)
    console.log(URL)
    this.http.get(URL, {responseType: 'text' as 'json'})
      .pipe(take(1))
      .subscribe(value => {
        console.log(value)
        this.cancelOpenOrders(symbol);
      })
  }

  public cancelOpenOrders(symbol: string): void {
    console.log('cancelOpenOrders' + symbol);
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + '/cancel-open-orders/' + JSON.stringify(params);
    this.http.get(URL, {responseType: 'text' as 'json'})
      .pipe(take(1))
      .subscribe((value) => {
        const msgServer: IMsgServer = JSON.parse(<string>value);
        this.functionsOrderService.popUpInfo(msgServer.msg);
      })
  }

  public getCurrentOpenOrder(): Observable<IOpenOrder[]> {
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const dataQueryString = `timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + '/current-order/' + JSON.stringify(params);
    return this.http.get<IOpenOrder[]>(URL);
  }

  public closeAllCurrentsOrders(allCurrenTokens: IOpenOrder[]): void {
    console.log(allCurrenTokens)
    this.functionsOrderService.popUpInfo('Close all')
    allCurrenTokens.forEach((currentToken: IOpenOrder) => {
      this.marketOrder(currentToken.symbol, SELL, currentToken.positionAmt, MARKET);
    })
  }

  public getDuplicateOrders(symbol: string): Observable<string> {
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + GET_ALL_ORDERS_SYMBOL + JSON.stringify(params)
    return this.http.get<string>(URL, {responseType: 'text' as 'json'})
  }

  public deleteDuplicateOrders(symbol: string, orderIdListRepetitions: number[]) {
    const apiKey: IApiKey | undefined = this.setAPIkey()
    let dataQueryString: string = '';
    let bodyUrl: string = '';
    let orderId: string = '';

    if (orderIdListRepetitions.length === 1) {
      orderId = `orderId=${orderIdListRepetitions[0]}`;
      bodyUrl = DELETE_ONE_ORDER_SYMBOL;

    } else if (1 < orderIdListRepetitions.length && orderIdListRepetitions.length < 11) {
      orderId = `orderIdList=[${orderIdListRepetitions}]`;
      bodyUrl = DELETE_ALL_ORDERS_SYMBOL;
    } else {
      const ordersId: number[] = [];
      for (let i = 0; i < orderIdListRepetitions.length; i++) {
        ordersId.push(orderIdListRepetitions[i]);
        if (orderIdListRepetitions.length > 10) {
          this.deleteDuplicateOrders(symbol, orderIdListRepetitions)
          orderIdListRepetitions.length = 0;
        }
      }
    }
    dataQueryString = `symbol=${symbol}&` + orderId + '&timestamp=' + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewRequest(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + bodyUrl + JSON.stringify(params)
    this.http.get<string>(URL, {responseType: 'text' as 'json'})
      .pipe(take(1))
      .subscribe()
  }

  public checkAndDeleteDuplicateOrders(symbol: string) {
    this.getDuplicateOrders(symbol)
      .pipe(
        take(1),
        filter(res => !!res)
      )
      .subscribe(allListOrdersSymbol => {
        const idListRepetitions = new Set;
        let allListOrdersSymbolJson: any = JSON.parse(<string>allListOrdersSymbol)
        for (let i = 0; i < allListOrdersSymbolJson.length; i++) {
          for (let j = i + 1; j < allListOrdersSymbolJson.length; j++) {
            if (allListOrdersSymbolJson[i].origQty === allListOrdersSymbolJson[j].origQty && allListOrdersSymbolJson[i].price === allListOrdersSymbolJson[j].price) {
              idListRepetitions.add(allListOrdersSymbolJson[i].orderId)
            }
          }
        }
        const orderIdListRepetitions: number[] = <number[]>Array.from(idListRepetitions);
        if (orderIdListRepetitions.length !== 0) {
          this.deleteDuplicateOrders(symbol, orderIdListRepetitions);
        }
      })
  }
}

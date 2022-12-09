import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";
import {API_KEY, MARKET, SELL} from "../../const/const";
import {BURL} from "../../const/http-request";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {Observable, take} from "rxjs";
import {FunctionsOrderService} from "./functions-order.service";
import {IMsgServer} from "../../interface/msg-server";
import {IOpenOrder} from "../../interface/order/open-order";
import {IParamSignatureNewOrder} from "../../interface/order/new-order";
import {IApiKey} from "../../interface/api-key";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              public functionsOrderService: FunctionsOrderService) {
  }

  public setAPIkey(): IApiKey | undefined {
    return JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public hashFunctions(dataQueryString: string, apiKey: IApiKey | undefined): string {
    return sha256.hmac.create(apiKey!.skey).update(dataQueryString).hex();
  }

  private paramsNewOrder(signature:string, dataQueryString:string, apiKey:string): IParamSignatureNewOrder {
    return {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey
    }
  }

  public newOrder(symbol: string, side: string, quantity: number, price: number = 0): Observable<string> {
    symbol = symbol.trim();
    let dataQueryString: string = price === 0 ?
      `symbol=${symbol}&side=${side}&quantity=${quantity}&type=MARKET&timestamp=` + Date.now() :
      `symbol=${symbol}&side=${side}&quantity=${quantity}&type=LIMIT&price=${price}&timeInForce=GTC&timestamp=` + Date.now();
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewOrder(signature, dataQueryString, apiKey!.akey);
    const URL: string = BURL + '/new-order/' + JSON.stringify(params)
    console.log(URL)
    return this.http.get<string>(URL, {responseType: 'text' as 'json'})
  }

  public marketOrder(symbol: string, side: string, quantity: string | number, type: string): void {
    const apiKey: IApiKey | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=${type}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: IParamSignatureNewOrder = this.paramsNewOrder(signature, dataQueryString, apiKey!.akey);
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
    const params: IParamSignatureNewOrder = this.paramsNewOrder(signature, dataQueryString, apiKey!.akey);
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
    const params: IParamSignatureNewOrder = this.paramsNewOrder(signature, dataQueryString, apiKey!.akey);
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
}

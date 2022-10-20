import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";
import {ALL_CREATED_CURRENT_ORDERS, API_KEY} from "../../const/const";
import {BURL} from "../../const/http-request";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {Observable} from "rxjs";
import {FunctionsOrderService} from "./functions-order.service";
import {IParamsOrder} from "../../interface/params-order";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              public functionsOrderService: FunctionsOrderService) {
  }

  public setAPIkey(): { akey: string, skey: string } | undefined {
    return JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public hashFunctions(dataQueryString: string, apiKey: { akey: string; skey: string } | undefined): string {
    return sha256.hmac.create(apiKey!.skey).update(dataQueryString).hex();
  }

  public newOrder(symbol: string, side: string, quantity: number | undefined, price: number = 0): Observable<Object> {
    let dataQueryString: string;
    symbol = symbol.trim();
    if (price === 0) {
      dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=MARKET&timestamp=` + Date.now();
    } else {
      dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=LIMIT&price=${price}&timeInForce=GTC&timestamp=` + Date.now();
    }
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const signature: string = this.hashFunctions(dataQueryString, apiKey);

    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + '/new-order/' + JSON.stringify(params)
    console.log(URL)
    return this.http.get(URL, {responseType: 'text' as 'json'}) // {"signature": signature,"dataQueryString":dataQueryString, "akey":apiKey!.akey}
  }

  public marketOrder(symbol: string, side: string, quantity: string, type: string): void {
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=${type}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);

    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + '/market-order/' + JSON.stringify(params)
    console.log(URL)
    this.http.get(URL, {responseType: 'text' as 'json'})
      .subscribe(value => console.log(value))
    this.cancelOpenOrders(symbol);
    setTimeout(() => {
      if (this.functionsOrderService.toggleRepeatOrder) {
        const paramOrder: IParamsOrder = JSON.parse(this.localStorageService.getLocalStorage(ALL_CREATED_CURRENT_ORDERS) || '[]')
        this.newOrder(paramOrder.symbol, 'BUY', paramOrder.quantity, paramOrder.price, paramOrder.price, paramOrder.price);
      }
    }, 2000)
  }

  public cancelOpenOrders(symbol: string) {
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);

    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + '/cancel-open-orders/' + JSON.stringify(params)
    console.log(URL)
    this.http.get(URL, {responseType: 'text' as 'json'})
      .subscribe(value => console.log(value))
  }

  public getCurrentOpenOrder(): Observable<Object> {
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + '/current-order/' + JSON.stringify(params);
    return this.http.get(URL)
  }

  public closeAllCurrentsOrders(symbol: string = 'BNBUSDT'): void {
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);
    const URL: string = BURL + `/order/closeOpenOrder/${signature}-${dataQueryString}-${apiKey!.akey}`
    console.log(URL)
    this.http.get(URL).subscribe((value: any) => {
      console.log(value)
    })
  }
}

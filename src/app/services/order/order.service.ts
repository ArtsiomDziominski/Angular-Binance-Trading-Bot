import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";
import {API_KEY, MARKET, SELL} from "../../const/const";
import {BURL} from "../../const/http-request";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {Observable} from "rxjs";
import {FunctionsOrderService} from "./functions-order.service";
import {IMsgServer} from "../../interface/msg-server";
import {ICurrenTokens} from "../../interface/currentToken";

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

  public newOrder(symbol: string, side: string, quantity: number, price: number = 0): Observable<Object> {
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
      .subscribe(value => {
        console.log(value)
        this.cancelOpenOrders(symbol);
      })

  }

  public cancelOpenOrders(symbol: string) {
    console.log('cancelOpenOrders' + symbol);
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
    const signature: string = this.hashFunctions(dataQueryString, apiKey);

    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + '/cancel-open-orders/' + JSON.stringify(params);
    this.http.get(URL, {responseType: 'text' as 'json'})
      .subscribe((value: any) => {
        const msgServer: IMsgServer = JSON.parse(value);
        this.functionsOrderService.popUpInfo(msgServer.msg);
      })
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

  public closeAllCurrentsOrders(allCurrenTokens: ICurrenTokens[]): void {
    console.log(allCurrenTokens)
    this.functionsOrderService.popUpInfo('Close all')
    allCurrenTokens.forEach((currentToken: ICurrenTokens) => {
      this.marketOrder(currentToken.symbol, SELL, currentToken.positionAmt, MARKET);
    })
  }
}

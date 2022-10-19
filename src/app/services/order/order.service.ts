import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";
import {API_KEY} from "../../const/const";
import {BURL} from "../../const/http-request";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
  }

  public setAPIkey(): { akey: string, skey: string } | undefined {
    return JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public hashFunctions(dataQueryString: string, apiKey: { akey: string; skey: string } | undefined): string {
    return sha256.hmac.create(apiKey!.skey).update(dataQueryString).hex();
  }

  public newOrder(symbol: string, side: string, quantity: string, type: string, price: string | number): Observable<Object> {
    symbol = symbol.trim();
    const apiKey: { akey: string, skey: string } | undefined = this.setAPIkey()
    const dataQueryString = `symbol=${symbol}&side=${side}&quantity=${quantity}&type=${type}&price=${price}&timeInForce=GTC&timestamp=` + Date.now();
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
    // return this.http.get(URL, {responseType: 'text' as 'json'}) // {"signature": signature,"dataQueryString":dataQueryString, "akey":apiKey!.akey}
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

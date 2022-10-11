import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class MainBlockPriceService {
  public httpGet: string = 'https://fapi.binance.com/fapi/v1/ticker/24hr'
  public allMainSaveTokens: string[] = ['BNBUSDT', 'BTCUSDT', 'XRPUSDT'];
  public mainSaveTokensBeh: BehaviorSubject<string[]> = new BehaviorSubject(this.allMainSaveTokens);
  public allGetTokens!: string[];

  constructor(private http: HttpClient) {
  }

  public addTokenMainList(nameToken: string): void {
    this.allMainSaveTokens.push(nameToken.toUpperCase())
    this.mainSaveTokensBeh.next(this.mainSaveTokens.filter(v => v));
  }

  public get mainSaveTokens() :string[] {
    return this.mainSaveTokensBeh.getValue();
  }

  public getPriceTokenHeader(): Observable<string[]> {
    const allTokens: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'DOGEUSDT'];

    return this.http.get(this.httpGet).pipe(
      map((response: any) => {
        const allPriceTokens: string[] = [];
        this.allGetTokens = response;
        console.log(response)
        response
          .find((item: any) => {
            for (let i = 0; i < allTokens.length; i++) {
              if (item.symbol === allTokens[i]) {
                allPriceTokens.push(item)
              }
            }
          });
        return allPriceTokens.sort((x: any, y: any) => x.symbol.localeCompare(y.symbol));
      }))
  }

  public getPriceTokenMain(): Observable<string[]> {
    return this.http.get(this.httpGet).pipe(
      map((response: any) => {
        const allPriceTokens: string[] = [];

        response
          .find((item: any) => {
            for (let i = 0; i < this.mainSaveTokens.length; i++) {
              if (item.symbol === this.mainSaveTokens[i]) {
                allPriceTokens.push(item)
              }
            }
          });

        return allPriceTokens;
      }))
  }

  public deleteBlockToken(nameToken: string): void {
    this.mainSaveTokensBeh.next(this.mainSaveTokens.filter(v => v !== nameToken));
  }
}

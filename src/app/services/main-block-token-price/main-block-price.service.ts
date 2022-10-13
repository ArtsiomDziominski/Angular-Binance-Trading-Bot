import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable} from "rxjs";
import {HTTP_GET_24hr} from "../../const/http-request";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {MAIN_SAVE_TOKEN_SAVE} from "../../const/const";

@Injectable({
  providedIn: 'root'
})

export class MainBlockPriceService {
  public allMainSaveTokens: string[] = JSON.parse(<string>this.localStorageService.getLocalStorage(MAIN_SAVE_TOKEN_SAVE)) || [];
  public mainSaveTokensBeh: BehaviorSubject<string[]> = new BehaviorSubject(this.allMainSaveTokens);
  public allGetTokens!: string[];

  constructor(private http: HttpClient, private localStorageService: LocalStorageService) {
  }

  public addTokenMainList(nameToken: string): string {
    let infoText: string = '';
    nameToken = nameToken.toUpperCase().trim();

    this.allMainSaveTokens.forEach(v => {
      if (v === nameToken) {
        infoText = nameToken + ' has been added before'
      }
    })

    if (!nameToken.match('USDT') && !nameToken.match('BUSD')) {
      return 'Must be present USDT or BUSD';
    } else if (!infoText) {
      this.allMainSaveTokens.push(nameToken);
      this.localStorageService.setLocalStorage(MAIN_SAVE_TOKEN_SAVE, JSON.stringify(this.allMainSaveTokens));
      return 'Save';
    }
    return infoText;
  }

  public get mainSaveTokens(): string[] {
    return this.mainSaveTokensBeh.getValue();
  }

  public getPriceTokenHeader(): Observable<string[]> {
    const allTokens: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'DOGEUSDT'];

    return this.http.get(HTTP_GET_24hr).pipe(
      map((response: any) => {
        const allPriceTokens: string[] = [];
        this.allGetTokens = response;
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
    return this.http.get(HTTP_GET_24hr).pipe(
      map((response: any) => {
        const allPriceTokens: string[] = [];
        response
          .find((item: any) => {
            for (let i = 0; i < this.allMainSaveTokens.length; i++) {
              if (item.symbol === this.allMainSaveTokens[i]) {
                allPriceTokens.push(item)
              }
            }
          });

        return allPriceTokens;
      }))
  }

  public deleteBlockToken(nameToken: string): void {
    this.mainSaveTokensBeh.next(this.mainSaveTokens.filter(v => v !== nameToken));
    this.allMainSaveTokens = this.allMainSaveTokens.filter(v => v !== nameToken);
    this.localStorageService.setLocalStorage(MAIN_SAVE_TOKEN_SAVE, JSON.stringify(this.allMainSaveTokens));
  }
}

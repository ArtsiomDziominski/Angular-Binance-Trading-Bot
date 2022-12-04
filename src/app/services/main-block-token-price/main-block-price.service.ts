import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, take} from "rxjs";
import {HTTP_GET_24hr} from "../../const/http-request";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {MAIN_SAVE_TOKEN_SAVE} from "../../const/const";
import {IPrice} from "../../interface/price-token";

@Injectable({
  providedIn: 'root'
})

export class MainBlockPriceService {
  public allMainSaveTokens: string[] = JSON.parse(<string>this.localStorageService.getLocalStorage(MAIN_SAVE_TOKEN_SAVE)) || [];
  public mainSaveTokensBeh: BehaviorSubject<string[]> = new BehaviorSubject(this.allMainSaveTokens);
  public allPriceTokens: IPrice[] = [];

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

  public getPriceTokenMain(): Observable<IPrice[]> {
    return this.http.get<IPrice[]>(HTTP_GET_24hr)
      .pipe(
        take(1),
        map((response: IPrice[]) => {
          const allPriceTokens: IPrice[] = [];
          this.allPriceTokens = response;
          response
            .find((item: IPrice) => {
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

  public getAllTokens(): IPrice[] {
    return this.allPriceTokens;
  }
}

import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ICurrenTokens} from "../../interface/currentToken";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";
import {OrderService} from "../../services/order/order.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  public allCurrentToken: ICurrenTokens[] = [];
  public apiKey: { akey: string, skey: string } | undefined;
  public isInfoOrderBox: boolean = false;
  public infoText: string = '';


  public symbolToken: string = '';
  public quantityToken: string = '';
  public priceToken: string = '';
  public quantityOrders: string = '';

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    public orderService: OrderService
  ) {
  }

  ngOnInit() {
    this.setAPIkey();
    this.getCurrentOpenOrder();
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || '[]';
  }

  public getCurrentOpenOrder(): void {
    this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
      this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);
    });
    setInterval(() => {
      this.orderService.getCurrentOpenOrder().subscribe((value: any) => {
        this.allCurrentToken = value.filter((v: any) => v.positionAmt > 0);
      });
    }, 3000)
  }

  // public closeAllCurrentsOrders(symbol: string = 'BNBUSDT'): void {
  //   const dataQueryString = `symbol=${symbol}&timestamp=` + Date.now();
  //   const signature: string = this.hashFunctions(dataQueryString);
  //   const URL: string = BURL + `/order/closeOpenOrder/${signature}-${dataQueryString}-${this.apiKey!.akey}`
  //   console.log(URL)
  //   this.http.get(URL).subscribe((value: any) => {
  //     console.log(value)
  //   })
  // }

  public newOrder(symbolToken: string, side: string, quantityToken: string, type: string, priceToken: string) {
    this.orderService.newOrder(symbolToken, side, quantityToken, type, priceToken)
      .subscribe(
        (value: any) => {
          let v = JSON.parse(value)
          if(v.code !== undefined){
            this.infoText = v.msg;
          } else {
            this.infoText = v.symbol;
          }
          this.isInfoOrderBox = true;
          setTimeout(() => this.isInfoOrderBox = false,5000);
        });
    this.symbolToken = '';
    this.quantityToken = '';
    this.priceToken = '';
    this.quantityOrders = '';
  }
}

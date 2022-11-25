import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {TextChangeService} from "../../services/text-change.service";
import {IPrice} from "../../interface/price-token";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  public priceTokensSave: IPrice[] = [];
  public pricePercentSort: IPrice[] = [];
  private priceTokenMain$!: Subscription;

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    public editText: TextChangeService,
  ) {
  }

  public ngOnInit(): void {
    this.priceTokenMain$ = this.mainBlockPrice.mainSaveTokensBeh
      .subscribe(() => {
        this.updatePriceTokens();
      });
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 31000);
    setTimeout(() => this.filterTokensPercent(), 3000);
  }

  public updatePriceTokens(): void {
    this.priceTokenMain$ = this.mainBlockPrice.getPriceTokenMain()
      .subscribe((res: IPrice[]) => {
        this.priceTokensSave = res.sort((x: IPrice, y: IPrice) => x.symbol.localeCompare(y.symbol));
        this.priceTokenMain$.unsubscribe();
      });
  }

  public filterTokensPercent(): void {
    const allTokensPrice: IPrice[] = this.mainBlockPrice.getAllTokens();
    this.pricePercentSort = allTokensPrice.sort((x: IPrice, y: IPrice | any) => Number(y.priceChangePercent.localeCompare(Number(x.priceChangePercent))));
  }
}

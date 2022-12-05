import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {TextChangeService} from "../../services/text-change.service";
import {IPrice} from "../../interface/price-token";
import {take} from "rxjs";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  public priceTokensSave: IPrice[] = [];
  public pricePercentSort: IPrice[] = [];

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    public editText: TextChangeService,
  ) {
  }

  public ngOnInit(): void {
    this.mainBlockPrice.mainSaveTokensBeh
      .pipe(take(1))
      .subscribe(() => {
        this.updatePriceTokens();
      });
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 31000);
    setTimeout(() => this.filterTokensPercent(), 3000);
  }

  public updatePriceTokens(): void {
    this.mainBlockPrice.getPriceTokenMain()
      .pipe(take(1))
      .subscribe((res: IPrice[]) => {
        this.priceTokensSave = res.sort((x: IPrice, y: IPrice) => x.symbol.localeCompare(y.symbol));
      });
  }

  public filterTokensPercent(): void {
    const allTokensPrice: IPrice[] = this.mainBlockPrice.allPriceTokens;
    this.pricePercentSort = allTokensPrice.sort((x: IPrice, y: IPrice) => Number(y.priceChangePercent) - Number(x.priceChangePercent));
  }
}

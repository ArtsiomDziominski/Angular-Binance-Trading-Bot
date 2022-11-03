import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {TextChangeService} from "../../services/text-change.service";
import {IPrice} from "../../interface/price-token";

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
    this.mainBlockPrice.mainSaveTokensBeh.subscribe(() => {
      this.updatePriceTokens();
    });
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 31000);
    setTimeout(() => this.filterTokensPercent(), 3000);
  }

  public updatePriceTokens(): void {
    this.mainBlockPrice.getPriceTokenMain().subscribe((data: any) => {
      this.priceTokensSave = data.sort((x: any, y: any) => x.symbol.localeCompare(y.symbol));
    });
  }

  public filterTokensPercent() {
    const allTokensPrice: IPrice[] = this.mainBlockPrice.getAllTokens();
    this.pricePercentSort = allTokensPrice.sort((x: any, y: any) => Number(y.priceChangePercent.localeCompare(Number(x.priceChangePercent))));
  }
}

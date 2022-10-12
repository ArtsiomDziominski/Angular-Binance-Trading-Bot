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
  public allPriceTokens: IPrice[] | undefined;

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    public editText: TextChangeService
  ) {
  }

  public ngOnInit(): void {
    this.mainBlockPrice.mainSaveTokensBeh.subscribe(() => {
      this.updatePriceTokens();
    });

    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 31000);
  }

  public updatePriceTokens(): void {
    this.mainBlockPrice.getPriceTokenMain().subscribe((data: any) => {
      this.allPriceTokens = data;
    });
  }
}

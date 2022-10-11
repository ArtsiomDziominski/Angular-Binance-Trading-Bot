import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "./services/main-block-token-price/main-block-price.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isOpenDialogBox: boolean = false;
  public isInfoSaveStorageBox: boolean = true;
  public allPriceTokensHeader!: any;
  public updateCounter: number = 0;

  constructor(private mainBlockPrice: MainBlockPriceService) {}

  public ngOnInit(): void {
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 20000);
    setInterval(() => this.updateCounter++, 1000);
  }

  public updatePriceTokens(): void {
    this.mainBlockPrice.getPriceTokenHeader().subscribe((data: string[]) => {
      this.allPriceTokensHeader = data;
    });
    this.updateCounter = -1;
  }

  public updateOpenDialogBox($event: boolean): void {
    this.isOpenDialogBox = $event;
  }
}

import {Component, Input} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";

@Component({
  selector: 'app-block-price',
  templateUrl: './block-price.component.html',
  styleUrls: ['./block-price.component.scss']
})
export class BlockPriceComponent{
  @Input()
  public nameToken!: string;
  @Input()
  public priceToken!: string;
  @Input()
  public h24Token!: string;
  @Input()
  public imgToken!: string;
  public isBlockPrice: boolean = true;

  constructor(private blockTokenPrice: MainBlockPriceService) {
  }

  public editStringToNumber(h24Token: string): number {
    return Number(h24Token);
  }

  public deleteBlockToken(nameToken: string): void {
    this.blockTokenPrice.deleteBlockToken(nameToken);
    this.isBlockPrice = false;
  }
}

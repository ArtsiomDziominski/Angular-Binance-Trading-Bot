import {Component} from '@angular/core';
import {MainBlockPriceService} from "../../../services/main-block-token-price/main-block-price.service";

@Component({
  selector: 'app-block-price-add',
  templateUrl: './block-price-add.component.html',
  styleUrls: ['./block-price-add.component.scss']
})
export class BlockPriceAddComponent {
  public isAddToken: boolean = true;
  public inputNameToken: string = ''

  constructor(private blockTokenPrice: MainBlockPriceService) {
  }

  public addTokenMain(nameToken: string): void {
    this.blockTokenPrice.addTokenMainList(nameToken);
    this.isAddToken = true

  }
}

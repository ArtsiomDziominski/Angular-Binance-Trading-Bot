import {Component} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FunctionsOrderService} from "../../services/order/functions-order.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public tokenSaveBoxPrice: string = '';

  public tokenSaveFormGroup!: FormGroup;

  constructor(
    public mainBlockPriceService: MainBlockPriceService,
    public functionsOrderService: FunctionsOrderService
  ) {
  }

  public ngOnInit(): void {
    this.tokenSaveFormGroup = new FormGroup({nameToken: new FormControl('', [Validators.required, Validators.minLength(4)])})
  }

  public saveTokenMainBoxPrice(token: string): void {
    this.functionsOrderService.popUpInfo(this.mainBlockPriceService.addTokenMainList(token));
  }
}

import {Component} from '@angular/core';
import {MainBlockPriceService} from "../../services/main-block-token-price/main-block-price.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public tokenSaveBoxPrice: string = '';
  public infoTextMainAddToken: string = ''

  public tokenSaveFormGroup!: FormGroup;

  constructor(public mainBlockPriceService: MainBlockPriceService) {
  }

  ngOnInit(): void {
    this.tokenSaveFormGroup = new FormGroup({nameToken: new FormControl('', [Validators.required, Validators.minLength(4)])})
  }

  public saveTokenMainBoxPrice(token: string) {
    this.infoTextMainAddToken = this.mainBlockPriceService.addTokenMainList(token)
    if (this.infoTextMainAddToken.length < 10) {
      this.tokenSaveBoxPrice = '';
    }
    setTimeout(() => this.infoTextMainAddToken = '', 5000)
  }
}

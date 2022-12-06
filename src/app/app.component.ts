import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "./services/main-block-token-price/main-block-price.service";
import {Router} from "@angular/router";
import {INFO_TEXT} from "./const/const";
import {LocalStorageService} from "./services/local-storage/local-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isInfoSaveStorageBox: boolean = true;

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {
  }

  public ngOnInit(): void {
    this.checkInfoText();
  }

  public checkInfoText(): void {
    this.isInfoSaveStorageBox = Boolean(this.localStorageService.getLocalStorage(INFO_TEXT));
  }

  public closeInfoBox(): void {
    this.isInfoSaveStorageBox = true
    this.localStorageService.setLocalStorage(INFO_TEXT, String(this.isInfoSaveStorageBox));
  }
}

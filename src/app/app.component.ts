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
  public isOpenDialogBox: boolean = false;
  public isInfoSaveStorageBox: boolean = true;
  public allPriceTokensHeader!: any;
  public updateCounter: number = 0;
  public menuActive: { name: string, is: boolean }[] =
    [
      {name: '', is: false},
      {name: 'order', is: false},
      {name: 'stat', is: false},
      {name: 'set', is: false}
    ];
  public currentURLRouting: string = '';

  constructor(private mainBlockPrice: MainBlockPriceService, private router: Router, private localStorageService: LocalStorageService) {
  }

  public ngOnInit(): void {
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 20000);
    setInterval(() => this.updateCounter++, 1000);

    this.router.events.subscribe(() => {
      this.currentURLRouting = this.router.url; // Update the value when a different route is accessed
      this.editActiveMenu();
    });
    this.checkInfoText();
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

  public editActiveMenu(): void {
    setTimeout(() => {
      this.currentURLRouting = this.currentURLRouting.replace('/', '')
      this.menuActive.forEach((value: { name: string; is: boolean; }) => {
        value.is = value.name == this.currentURLRouting;
      })
    }, 100)
  }

  public checkInfoText(): void {
    this.isInfoSaveStorageBox = Boolean(this.localStorageService.getLocalStorage(INFO_TEXT));
  }

  public closeInfoBox(): void {
    this.isInfoSaveStorageBox = true
    this.localStorageService.setLocalStorage(INFO_TEXT, String(this.isInfoSaveStorageBox));
  }
}

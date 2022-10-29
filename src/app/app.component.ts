import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "./services/main-block-token-price/main-block-price.service";
import {Router} from "@angular/router";
import {INFO_TEXT} from "./const/const";
import {LocalStorageService} from "./services/local-storage/local-storage.service";
import {MatDialog} from "@angular/material/dialog";
import {ApiBoxComponent} from "./components/api-box/api-box.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isInfoSaveStorageBox: boolean = true;
  public allPriceTokensHeader!: any;
  public menuActive: { name: string, isActive: boolean }[] =
    [
      {name: '', isActive: false},
      {name: 'order', isActive: false},
      {name: 'stat', isActive: false},
      {name: 'set', isActive: false}
    ];
  public currentURLRouting: string = '';

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    private router: Router,
    private localStorageService: LocalStorageService,
    public dialog: MatDialog
  ) {
  }

  public ngOnInit(): void {
    this.updatePriceTokens();
    setInterval(() => this.updatePriceTokens(), 20000);

    this.router.events.subscribe(() => {
      this.currentURLRouting = this.router.url;
      this.editActiveMenu();
    });
    this.checkInfoText();
  }

  public updatePriceTokens(): void {
    this.mainBlockPrice.getPriceTokenHeader().subscribe((res: string[]) => {
      this.allPriceTokensHeader = res;
    });
  }

  public editActiveMenu(): void {
    setTimeout(() => {
      this.currentURLRouting = this.currentURLRouting.replace('/', '')
      this.menuActive.forEach((value: { name: string; isActive: boolean; }) => {
        value.isActive = value.name == this.currentURLRouting;
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

  public openDialog() {
    this.dialog.open(ApiBoxComponent, {
      width: '800px',
    });
  }
}

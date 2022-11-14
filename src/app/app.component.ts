import {Component, OnInit} from '@angular/core';
import {MainBlockPriceService} from "./services/main-block-token-price/main-block-price.service";
import {Router} from "@angular/router";
import {INFO_TEXT} from "./const/const";
import {LocalStorageService} from "./services/local-storage/local-storage.service";
import {MatDialog} from "@angular/material/dialog";
import {ApiBoxComponent} from "./components/api-box/api-box.component";
import {DialogBoxAllWalletComponent} from "./components/dialog-box-all-wallet/dialog-box-all-wallet.component";
import {FunctionsOrderService} from "./services/order/functions-order.service";
import {WalletBscService} from "./services/wallet/wallet-bsc.service";
import {IAccountBalance} from "./interface/account-balance";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isInfoSaveStorageBox: boolean = true;
  public isConnectWallet: boolean = false;
  public addressWallet: string = '';
  public currentBalance: string = '';

  constructor(
    private mainBlockPrice: MainBlockPriceService,
    private router: Router,
    private localStorageService: LocalStorageService,
    public dialog: MatDialog,
    public functionsOrderService: FunctionsOrderService,
    public walletBscService: WalletBscService
  ) {
  }

  public async ngOnInit(): Promise<void> {
    await this.checkConnectionStatus();
    this.checkInfoText();
  }

  public getBalance(): void {
    this.walletBscService.getBalance(this.addressWallet)
      .subscribe((value:IAccountBalance) => {
        this.currentBalance = (Number(value.result) / 1000000000000000000).toFixed(4)
      });
  }

  public async checkConnectionStatus() {
    await this.walletBscService.connectMetamask()
      .then(res => {
        this.addressWallet = res[0];
        this.isConnectWallet = true;
        this.getBalance();
      })
  }

  public checkInfoText(): void {
    this.isInfoSaveStorageBox = Boolean(this.localStorageService.getLocalStorage(INFO_TEXT));
  }

  public closeInfoBox(): void {
    this.isInfoSaveStorageBox = true
    this.localStorageService.setLocalStorage(INFO_TEXT, String(this.isInfoSaveStorageBox));
  }

  public openDialog(): void {
    this.dialog.open(ApiBoxComponent, {
      width: '800px',
    });
  }

  public async checkConnectMetamask() {
    let result: boolean = true;
    await this.walletBscService.isConnected()
      .then(res => result = res)
    return result;
  }

  public async openDialogAllWallet(): Promise<void> {
    if (!this.isConnectWallet) {
      const dialogRef = this.dialog.open(DialogBoxAllWalletComponent, {
        width: '500px',
      });

      dialogRef.afterClosed().subscribe(addressWallet => {
        this.addressWallet = addressWallet;
        this.isConnectWallet = true;
        this.getBalance();
      });
    }
  }
}

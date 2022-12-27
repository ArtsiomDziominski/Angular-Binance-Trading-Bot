import {Component} from '@angular/core';
import {ApiBoxComponent} from "../api-box/api-box.component";
import {DIVISION_NUMBER, WIDTH_DIALOG_BOX_API, WIDTH_DIALOG_BOX_WALLET} from "../../const/const";
import {MatDialog} from "@angular/material/dialog";
import {take} from "rxjs";
import {IAccountBalance} from "../../interface/account-balance";
import {WalletBscService} from "../../services/wallet/wallet-bsc.service";
import {DialogBoxAllWalletComponent} from "../dialog-box-all-wallet/dialog-box-all-wallet.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public currentBalance: string = '';
  public addressWallet: string = '';
  public isConnectWallet: boolean = false;

  constructor(
    private dialog: MatDialog,
    public walletBscService: WalletBscService,
  ) {
  }

  public getBalance(): void {
    this.walletBscService.getBalance(this.addressWallet)
      .pipe(take(1))
      .subscribe((value: IAccountBalance) => {
        this.currentBalance = (Number(value.result) / DIVISION_NUMBER).toFixed(4)
      });
  }

  public openDialog(): void {
    this.dialog.open(ApiBoxComponent, {
      width: WIDTH_DIALOG_BOX_API,
    });
  }

  public async openDialogAllWallet(): Promise<void> {
    if (!this.isConnectWallet) {
      const dialogRef = this.dialog.open(DialogBoxAllWalletComponent, {
        width: WIDTH_DIALOG_BOX_WALLET,
      });

      dialogRef.afterClosed()
        .pipe(take(1))
        .subscribe(addressWallet => {
          this.addressWallet = addressWallet;
          this.isConnectWallet = true;
          this.getBalance();
        });
    }
  }
}

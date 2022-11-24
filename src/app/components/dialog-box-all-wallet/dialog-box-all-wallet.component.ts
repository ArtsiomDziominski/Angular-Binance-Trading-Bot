import {Component} from '@angular/core';
import {WalletAptosService} from "../../services/wallet/wallet-aptos.service";
import {MatDialogRef} from "@angular/material/dialog";
import {WalletBscService} from "../../services/wallet/wallet-bsc.service";


@Component({
  selector: 'app-dialog-box-all-wallet',
  templateUrl: './dialog-box-all-wallet.component.html',
  styleUrls: ['./dialog-box-all-wallet.component.scss']
})
export class DialogBoxAllWalletComponent {
  constructor(
    public wallet: WalletAptosService,
    public walletBsc: WalletBscService,
    public dialogRef: MatDialogRef<DialogBoxAllWalletComponent>,
  ) {
  }

  public connectWalletMetamask(): void | Promise<void> {
    this.walletBsc.connectMetamask()
      .then((res:string[]) => this.dialogRef.close(res[0]));
  }
}

import {Injectable} from '@angular/core';
import {IAddressKey} from "../../interface/address-key";

@Injectable({
  providedIn: 'root'
})
export class WalletAptosService {
  public walletPetra = (window as any).aptos;

  public async checkConnectionStatus() {
    return this.walletPetra.isConnected()
  }

  public connectWallet(): Promise<IAddressKey> {
    return this.walletPetra.connect()
  }

  public disconnectWallet(): Promise<string> {
    return this.walletPetra.disconnect()
  }

  public getCurrentAccount() {
    return this.walletPetra.account()
  }

  public getCurrentNetwork() {
    return this.walletPetra.network()
  }
}

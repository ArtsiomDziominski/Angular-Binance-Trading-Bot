import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IAccountBalance} from "../../interface/account-balance";

@Injectable({
  providedIn: 'root'
})
export class WalletBscService {
  public walletEthereum = (window as any).ethereum;

  constructor(private http: HttpClient) {
  }

  public connectMetamask(): Promise<string[]> {
    return this.walletEthereum.request({method: 'eth_requestAccounts'});
  }

  public async isConnected(): Promise<boolean> {
    return await this.walletEthereum.isConnected();
  }

  public getBalance(addressWallet:string): Observable<IAccountBalance> {
    // @ts-ignore
    return this.http.get(`https://api-testnet.bscscan.com/api?module=account&action=balance&address=${addressWallet}&tag=latest&apikey=YourApiKeyToken`)
  }
}

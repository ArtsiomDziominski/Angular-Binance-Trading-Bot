import {Injectable} from '@angular/core';
import {sha256} from "js-sha256";

@Injectable({
  providedIn: 'root'
})
export class Sha256Service {

  public hashFunctions(dataQueryString: string, apiKey: { akey: string, skey: string } | undefined): string {
    return sha256.hmac.create(apiKey!.skey).update(dataQueryString).hex();
  }
}

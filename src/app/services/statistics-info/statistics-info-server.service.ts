import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {BURL} from "../../const/http-request";
import {Sha256Service} from "../sha256.service";
import {LocalStorageService} from "../local-storage/local-storage.service";

@Injectable({
  providedIn: 'root'
})

export class StatisticsInfoServerService {
  constructor(private http: HttpClient, public sha256Service: Sha256Service, private localStorageService: LocalStorageService) {
  }

  public requestToServer(bodyURL: string, limit: string = ''): Observable<Object> {
    const apiKey: { akey: string, skey: string } | undefined = this.localStorageService.setAPIkey()
    const dataQueryString = limit +`timestamp=` + Date.now();
    const signature = this.sha256Service.hashFunctions(dataQueryString, apiKey!)
    const params: { signature: string, dataQueryString: string, akey: string } = {
      "signature": signature,
      "dataQueryString": dataQueryString,
      "akey": apiKey!.akey
    }
    const URL: string = BURL + bodyURL + JSON.stringify(params);
    return this.http.get(URL);
  }
}

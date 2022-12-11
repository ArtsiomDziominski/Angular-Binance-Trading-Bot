import { Injectable } from '@angular/core';
import {API_KEY} from "../const/const";
import {IApiKey} from "../interface/api-key";
import {LocalStorageService} from "./local-storage/local-storage.service";
import {FunctionsOrderService} from "./order/functions-order.service";
import {CHECK_API_KEY} from "../const/message-pop-up-info";

@Injectable({
  providedIn: 'root'
})
export class MainCommonService {
  public apiKey: IApiKey | undefined = undefined;

  constructor(
    private localStorageService: LocalStorageService,
    private functionsOrderService: FunctionsOrderService) {
  }

  public setAPIkey(): void {
    this.apiKey = JSON.parse(<string>this.localStorageService.getLocalStorage(API_KEY)) || undefined;
    if (!this.apiKey) this.functionsOrderService.popUpInfo(CHECK_API_KEY);
  }
}

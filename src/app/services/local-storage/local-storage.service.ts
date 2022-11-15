import { Injectable } from '@angular/core';
import {API_KEY} from "../../const/const";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public setLocalStorage(key: string, value: string| boolean): void {
    localStorage.setItem(key, <string>value)
  }

  public getLocalStorage(key: string): string | null | undefined {
    return localStorage.getItem(key);
  }

  public setAPIkey(): { akey: string, skey: string } | undefined {
    return JSON.parse(<string>this.getLocalStorage(API_KEY)) || '[]';
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public saveLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value)
  }
}

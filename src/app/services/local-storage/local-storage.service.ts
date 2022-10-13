import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public setLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  public getLocalStorage(key: string): string | null | undefined {
    return localStorage.getItem(key);
  }
}

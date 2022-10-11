import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextChangeService {

  public editToFixed2(param: string): string {
    return Number(param).toFixed(2);
  }
}

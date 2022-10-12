import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextChangeService {

  public editToFixed2(param: string | number): string {
    param = Number(param)
    return param !== 0? param.toFixed(2) : '0';
  }
}

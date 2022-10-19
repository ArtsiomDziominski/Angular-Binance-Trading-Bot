import {Component, EventEmitter, Output} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";

@Component({
  selector: 'app-api-box',
  templateUrl: './api-box.component.html',
  styleUrls: ['./api-box.component.scss']
})
export class ApiBoxComponent {
  public apiKey: string = '';
  public secretKey: string = '';

  @Output() isOpenDialogBox: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private localStorageService: LocalStorageService) {
  }

  public closeApiBox(): void {
    this.isOpenDialogBox.emit(false);
  }

  public saveApi(apiKey: string = '', secretKey: string = ''): void {
    const key: { akey: string, skey: string } = {akey: apiKey, skey: secretKey};
    this.localStorageService.setLocalStorage(API_KEY, JSON.stringify(key));
    this.isOpenDialogBox.emit(false);
  }
}

import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {API_KEY} from "../../const/const";
import {MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FunctionsOrderService} from "../../services/order/functions-order.service";

@Component({
  selector: 'app-api-box',
  templateUrl: './api-box.component.html',
  styleUrls: ['./api-box.component.scss']
})
export class ApiBoxComponent implements OnInit {
  public apiKey: string = '';
  public secretKey: string = '';

  public apiFormGroup = new FormGroup(
    {
      apiKeyControl: new FormControl('', [Validators.minLength(20), Validators.required]),
      secretKeyControl: new FormControl('', [Validators.minLength(20), Validators.required]),
    })

  constructor(
    private localStorageService: LocalStorageService,
    public dialogRef: MatDialogRef<ApiBoxComponent>,
    public functionsOrderService:FunctionsOrderService
  ) {
  }

  public ngOnInit(): void {
    this.apiFormGroup.valueChanges.subscribe(valueApi => {
      this.apiKey = valueApi.apiKeyControl || '';
      this.secretKey = valueApi.secretKeyControl || '';
    })
  }

  public closeDialogBox(): void {
    this.dialogRef.close();
  }

  public saveApi(): void {
    let key: { akey: string, skey: string } = {akey: this.apiKey, skey: this.secretKey};
    this.localStorageService.setLocalStorage(API_KEY, JSON.stringify(key!));
    this.functionsOrderService.popUpInfo('Save API');
    this.closeDialogBox();
  }
}

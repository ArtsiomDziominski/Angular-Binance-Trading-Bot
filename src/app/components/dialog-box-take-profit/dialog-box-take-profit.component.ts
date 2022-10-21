import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {IDialogDataTakeProfit} from "../../interface/dialog-data-take-profit";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-dialog-box-take-profit',
  templateUrl: './dialog-box-take-profit.component.html',
  styleUrls: ['./dialog-box-take-profit.component.css']
})
export class DialogBoxTakeProfitComponent {
  public newOrderFormGroup!: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: IDialogDataTakeProfit) {}

  ngOnInit(){
    this.newOrderFormGroup = new FormGroup(
      {
        takeProfit: new FormControl('', [Validators.required, Validators.minLength(1)]),
      })
  }
}

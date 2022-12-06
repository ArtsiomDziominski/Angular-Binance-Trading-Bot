import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {IDialogDataTakeProfit} from "../../interface/dialog-data-take-profit";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-dialog-box-take-profit',
  templateUrl: './dialog-box-take-profit.component.html',
  styleUrls: ['./dialog-box-take-profit.component.css']
})
export class DialogBoxTakeProfitComponent implements OnInit{
  public takeProfit = new FormControl('', [Validators.required, Validators.minLength(1)])

  constructor(@Inject(MAT_DIALOG_DATA) public data: IDialogDataTakeProfit) {
  }

  public ngOnInit(): void {
    this.takeProfit.valueChanges
      .subscribe((value: string | null) => this.data.profit = Number(value) || 0);
  }
}

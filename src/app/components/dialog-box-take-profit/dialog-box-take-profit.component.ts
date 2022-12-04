import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {IDialogDataTakeProfit} from "../../interface/dialog-data-take-profit";
import {FormControl, Validators} from "@angular/forms";
import {take} from "rxjs";

@Component({
  selector: 'app-dialog-box-take-profit',
  templateUrl: './dialog-box-take-profit.component.html',
  styleUrls: ['./dialog-box-take-profit.component.css']
})
export class DialogBoxTakeProfitComponent {
  public takeProfit = new FormControl('', [Validators.required, Validators.minLength(1)])

  constructor(@Inject(MAT_DIALOG_DATA) public data: IDialogDataTakeProfit) {
  }

  ngOnInit() {
    this.takeProfit.valueChanges
      .pipe(take(1))
      .subscribe((value: string | null) => this.data.profit = Number(value) || 0);
  }
}

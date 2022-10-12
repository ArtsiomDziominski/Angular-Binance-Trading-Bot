import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-order-row',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss']
})
export class OrderRowComponent {
  @Input()
  public symbol!: string;
  @Input()
  public amount!: string;
  @Input()
  public pnl!: string;
}

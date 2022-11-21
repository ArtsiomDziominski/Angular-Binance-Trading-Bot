import {Component, Input} from '@angular/core';
import {TextChangeService} from "../../services/text-change.service";

@Component({
  selector: 'app-list-top-token',
  templateUrl: './list-top-token.component.html',
  styleUrls: ['./list-top-token.component.scss']
})
export class ListTopTokenComponent {
  @Input() symbol: string = '';
  @Input() lastPrice: string = '';
  @Input() priceChangePercent: string | number = '';
  @Input() volume: string | number | undefined = '';

  constructor(public textChangeService: TextChangeService) {
  }

}

import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-api-box',
  templateUrl: './api-box.component.html',
  styleUrls: ['./api-box.component.scss']
})
export class ApiBoxComponent {
  @Output() isOpenDialogBox: EventEmitter<boolean> = new EventEmitter<boolean>();

  public statusApiBox() {
    this.isOpenDialogBox.emit(false);
  }
}

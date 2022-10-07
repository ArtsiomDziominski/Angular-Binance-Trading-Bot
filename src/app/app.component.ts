import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isOpenDialogBox: boolean = false;
  public isInfoSaveStorageBox: boolean = true;

  public ngOnInit() {

  }

  public updateOpenDialogBox($event: boolean) {
    this.isOpenDialogBox = $event;
  }
}

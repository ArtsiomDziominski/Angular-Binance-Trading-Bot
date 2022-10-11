import {Component, OnInit} from '@angular/core';
import {StatisticsInfoServerService} from "../../services/statistics-info/statistics-info-server.service";
import {IStatAcc} from "../../interface/stat-acc";
import {TextChangeService} from "../../services/text-change.service";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public statisticsAccount: IStatAcc[] | undefined;

  constructor(
    public editText: TextChangeService,
    public statisticsInfoService: StatisticsInfoServerService
  ) {
  }

  public ngOnInit(): void {
    this.getStatAcc();
  }

  public getStatAcc(): void {
    this.statisticsInfoService.getStatAcc()
      .subscribe((response: any) => {
        this.statisticsAccount = response
        console.log(this.statisticsAccount)
      })
  }

  public stringToNumber(value: string): number {
    return Number(value);
  }
}

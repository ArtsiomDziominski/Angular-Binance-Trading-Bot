import {Component, OnInit} from '@angular/core';
import {StatisticsInfoServerService} from "../../services/statistics-info/statistics-info-server.service";
import {IStatAcc} from "../../interface/stat-acc";
import {TextChangeService} from "../../services/text-change.service";
import {BALANCE, INCOME_HISTORY, LIMIT_INCOME_HISTORY} from "../../const/http-request";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public statisticsAccount: IStatAcc[] | undefined;
  public isLoader: boolean = false;
  public incomeHistory: IIncomeHistoryFull[] = [];

  constructor(
    public editText: TextChangeService,
    public statisticsInfoService: StatisticsInfoServerService,
  ) {
  }

  public ngOnInit(): void {
    this.getStatAcc();
    setInterval(() => this.getStatAcc(), 10000);
    this.getIncomeHistory();
  }

  public getStatAcc(): void {
    this.statisticsInfoService.requestToServer(BALANCE)
      .subscribe((response: any) => {
        this.statisticsAccount = response;
        this.isLoader = true;
      })
  }

  public getIncomeHistory(): void {
    this.statisticsInfoService.requestToServer(INCOME_HISTORY, LIMIT_INCOME_HISTORY)
      .subscribe((response: any) => {
        this.incomeHistory = response;
        this.isLoader = true;
      })
  }

  public stringToNumber(value: string): number {
    return Number(value);
  }
}

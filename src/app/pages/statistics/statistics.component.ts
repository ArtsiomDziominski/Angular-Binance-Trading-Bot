import {Component, OnDestroy, OnInit} from '@angular/core';
import {StatisticsInfoServerService} from "../../services/statistics-info/statistics-info-server.service";
import {IStatAcc} from "../../interface/stat-acc";
import {TextChangeService} from "../../services/text-change.service";
import {BALANCE, INCOME_HISTORY, LIMIT_INCOME_HISTORY} from "../../const/http-request";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";
import {take} from "rxjs";
import {MainCommonService} from "../../services/main-common.service";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  public statisticsAccount: IStatAcc[] | undefined;
  public isLoader: boolean = false;
  public incomeHistory!: IIncomeHistoryFull[];
  private setIntervalStatAcc!: number;

  constructor(
    public editText: TextChangeService,
    public statisticsInfoService: StatisticsInfoServerService,
    private mainCommonService: MainCommonService
  ) {
  }

  public ngOnInit(): void {
    if (this.mainCommonService.setAPIkey()) {
      this.getStatAcc();
      this.setIntervalStatAcc = window.setInterval(() => this.getStatAcc(), 10000);
      this.getIncomeHistory();
    }
  }

  public ngOnDestroy() {
    clearInterval(this.setIntervalStatAcc);
  }

  public getStatAcc(): void {
    this.statisticsInfoService.requestToServer(BALANCE)
      .pipe(take(1))
      .subscribe((response) => {
        this.statisticsAccount = <IStatAcc[]>response;
      })
  }

  public getIncomeHistory(): void {
    this.statisticsInfoService.requestToServer(INCOME_HISTORY, LIMIT_INCOME_HISTORY)
      .pipe(take(1))
      .subscribe((response) => {
        this.incomeHistory = <IIncomeHistoryFull[]>response;
        this.isLoader = true;
      })
  }

  public stringToNumber(value: string): number {
    return Number(value);
  }
}

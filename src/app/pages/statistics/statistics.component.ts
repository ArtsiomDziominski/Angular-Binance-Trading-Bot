import {Component, OnInit} from '@angular/core';
import {StatisticsInfoServerService} from "../../services/statistics-info/statistics-info-server.service";
import {IStatAcc} from "../../interface/stat-acc";
import {TextChangeService} from "../../services/text-change.service";
import {BALANCE, INCOME_HISTORY, LIMIT_INCOME_HISTORY} from "../../const/http-request";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public statisticsAccount: IStatAcc[] | undefined;
  public isLoader: boolean = false;
  public incomeHistory!: IIncomeHistoryFull[];

  public balance$!:Subscription;
  public incomeHistory$!:Subscription;

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
    this.balance$ = this.statisticsInfoService.requestToServer(BALANCE)
      .subscribe((response) => {
        this.statisticsAccount = <IStatAcc[]>response;
        this.balance$.unsubscribe();
      })
  }

  public getIncomeHistory(): void {
    this.incomeHistory$ = this.statisticsInfoService.requestToServer(INCOME_HISTORY, LIMIT_INCOME_HISTORY)
      .subscribe((response) => {
        this.incomeHistory = <IIncomeHistoryFull[]>response;
        this.isLoader = true;
        this.incomeHistory$.unsubscribe();
      })
  }

  public stringToNumber(value: string): number {
    return Number(value);
  }
}

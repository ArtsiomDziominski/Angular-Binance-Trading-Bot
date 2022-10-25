import {Component, OnInit} from '@angular/core';
import {StatisticsInfoServerService} from "../../services/statistics-info/statistics-info-server.service";
import {IStatAcc} from "../../interface/stat-acc";
import {TextChangeService} from "../../services/text-change.service";
import {BALANCE, INCOME_HISTORY, LIMIT_INCOME_HISTORY} from "../../const/http-request";
import {IIncomeHistory} from "../../interface/statistics/income-history";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public statisticsAccount: IStatAcc[] | undefined;
  public isLoader: boolean = false;
  public incomeHistory: IIncomeHistory[] = [];

  constructor(
    public editText: TextChangeService,
    public statisticsInfoService: StatisticsInfoServerService,
  ) {
  }

  public ngOnInit(): void {
    this.getStatAcc();
    setInterval(()=>this.getStatAcc(),10000);
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
        response.forEach((res:any) => {
          if (res.incomeType === 'COMMISSION'){
            this.incomeHistory.push({incomeType: res.incomeType, income: Number(res.income), time: res.time})
          }
        })
        this.isLoader = true;
      })
  }

  public stringToNumber(value: string): number {
    return Number(value);
  }
}

import {Injectable} from '@angular/core';
import {IIncomeHistory} from "../../interface/statistics/income-history";
import {IIncomeHistoryFilter} from "../../interface/statistics/income-history-filter";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";

@Injectable({
  providedIn: 'root'
})
export class StatisticsGraphService {
  public commissionIncomeHistory: IIncomeHistory[] = [];
  public realizedPNLIncomeHistory: IIncomeHistory[] = [];

  public filterIncomeHistory(incomeHistory: IIncomeHistoryFull[] = []): void {
    this.commissionIncomeHistory = []
    this.realizedPNLIncomeHistory = []
    incomeHistory.forEach((res: IIncomeHistoryFull) => {
      switch (res.incomeType) {
        case "COMMISSION":
          this.commissionIncomeHistory.push({incomeType: res.incomeType, income: Number(res.income), time: res.time});
          break;
        case "REALIZED_PNL":
          this.realizedPNLIncomeHistory.push({incomeType: res.incomeType, income: Number(res.income), time: res.time});
          break;
      }
    })
  }

  public filterIncomeType(incomeHistory: IIncomeHistory[]): IIncomeHistoryFilter[] {
    let dayTime: string = '';
    let incomeCount: number = 0;
    const incomeHistoryFilter: IIncomeHistoryFilter[] = [];
    incomeHistory.forEach((v:IIncomeHistory) => {
      const dateIncomeHistory: string = new Date(v!.time).toDateString();
      if (dateIncomeHistory === dayTime || dayTime === '') {
      } else {
        incomeHistoryFilter.push({income: Number(incomeCount.toFixed(5)), incomeType: v.incomeType, date:dayTime});
        incomeCount = 0
      }
      incomeCount += v.income;
      dayTime = dateIncomeHistory;
    })
    return incomeHistoryFilter;
  }
}

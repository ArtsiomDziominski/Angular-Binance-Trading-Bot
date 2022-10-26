import {Component, Input, OnInit} from '@angular/core';
import {Chart, registerables} from "chart.js";
import {IIncomeHistory} from "../../interface/statistics/income-history";
import {StatisticsGraphService} from "../../services/statistics-info/statistics-graph.service";
import {GRAPH_PROFIT, GRAPH_LABEL_COMMISSION, GRAPH_REALIZED_PNL} from "../../const/const";
import {IIncomeHistoryFilter} from "../../interface/statistics/income-history-filter";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";

@Component({
  selector: 'app-graph-statistics',
  templateUrl: './graph-statistics.component.html',
  styleUrls: ['./graph-statistics.component.css']
})
export class GraphStatisticsComponent implements OnInit {
  @Input() public allIncomeHistories!: IIncomeHistoryFull[];
  @Input() public windowWidth!: number;

  public incomeCommission: number[] = [];
  public incomeTypeCommission: string = '';
  public incomeTimeCommission: string[] = [];

  public incomeRealizedPNL: number[] = [];
  public incomeTypeRealizedPNL: string = '';
  public incomeTimeRealizedPNL: string[] = [];

  public profitPNL: number[] = [];

  constructor(
    public statisticsGraphService: StatisticsGraphService,
  ) {
    Chart.register(...registerables);
  }

  public ngOnInit(): void {
    setTimeout(() => this.getIncomeTimeHistory(), 3000);
    setTimeout(() => this.renderingGraph(), 3000);
  }

  public renderingGraph() {
    const data = {
      labels: this.incomeTimeCommission,
      datasets: [
        {
          label: GRAPH_PROFIT,
          data: this.profitPNL,
          fill: false,
          borderColor: ['rgb(255,242,0)'],
          backgroundColor: ['rgb(255,242,0)'],
        },
        {
          label: GRAPH_REALIZED_PNL,
          data: this.incomeRealizedPNL,
          fill: false,
          borderColor: ['rgba(76,238,113,0.9)'],
          backgroundColor: ['rgba(76,238,113,0.9)'],
        },
        {
          label: GRAPH_LABEL_COMMISSION,
          data: this.incomeCommission,
          fill: false,
          borderColor: ['rgba(255,0,0,0.4)'],
          backgroundColor: ['rgba(255,0,0,0.4)'],
        },
      ]
    };

    const chart = new Chart("chart", {
      type: 'line',
      data: data,
    });
  }

  public getIncomeTimeHistory(): void {
    this.statisticsGraphService.filterIncomeHistory(this.allIncomeHistories);
    const commissionIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.getCommissionIncomeHistory();
    this.sortForGraphIncomeHistoryСommission(this.statisticsGraphService.filterIncomeType(commissionIncomeHistory));
    const realizedPNLIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.getRealizedPNLIncomeHistory();
    this.sortForGraphIncomeHistoryRealizedPNL(this.statisticsGraphService.filterIncomeType(realizedPNLIncomeHistory));
    this.sortForGraphIncomeHistoryProfit();
  }

  public sortForGraphIncomeHistoryСommission(incomeHistoryCommission: IIncomeHistoryFilter[]) {
    incomeHistoryCommission.forEach((v:IIncomeHistoryFilter) => {
      this.incomeCommission.push(v.income);
      this.incomeTypeCommission = v.incomeType;
      this.incomeTimeCommission.push(v.date);
    })
  }

  public sortForGraphIncomeHistoryRealizedPNL(incomeHistoryRealizedPNL: IIncomeHistoryFilter[]) {
    incomeHistoryRealizedPNL.forEach(v => {
      this.incomeRealizedPNL.push(v.income);
      this.incomeTypeRealizedPNL = v.incomeType;
      this.incomeTimeRealizedPNL.push(v.date);
    })
  }

  public sortForGraphIncomeHistoryProfit() {
    for (let i = 0; i < this.incomeCommission.length; i++) {
      this.profitPNL.push(this.incomeCommission[i] + this.incomeRealizedPNL[i]);
    }
  }
}

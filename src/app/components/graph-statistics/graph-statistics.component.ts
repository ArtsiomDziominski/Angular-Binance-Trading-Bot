import {ChangeDetectionStrategy, Component, Input, OnInit, OnChanges} from '@angular/core';
import {Chart, registerables} from "chart.js";
import {IIncomeHistory} from "../../interface/statistics/income-history";
import {StatisticsGraphService} from "../../services/statistics-info/statistics-graph.service";
import {IIncomeHistoryFilter} from "../../interface/statistics/income-history-filter";
import {IIncomeHistoryFull} from "../../interface/statistics/income-history-full";
import {
  GRAPH_LABEL_COMMISSION_BACKGROUND_COLOR, GRAPH_LABEL_COMMISSION_BORDER_COLOR,
  GRAPH_PROFIT_BACKGROUND_COLOR, GRAPH_PROFIT_BORDER_COLOR,
  GRAPH_REALIZED_PN_BACKGROUND_COLOR, GRAPH_REALIZED_PN_BORDER_COLOR,
  GRAPH_PROFIT, GRAPH_LABEL_COMMISSION, GRAPH_REALIZED_PNL
} from "../../const/graph";
import {ISortIncome} from "../../interface/statistics/sort-income";

@Component({
  selector: 'app-graph-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph-statistics.component.html',
  styleUrls: ['./graph-statistics.component.css']
})
export class GraphStatisticsComponent implements OnInit, OnChanges {
  @Input() public allHistoryIncome!: IIncomeHistoryFull[];
  @Input() public windowWidth!: number;

  private historyIncome: ISortIncome = {
    time: [],
    realizedPNL: {type: '', value: []},
    commission: {type: '', value: []},
    profitPNL: [],
  }

  public chart!: Chart

  constructor(
    public statisticsGraphService: StatisticsGraphService,
  ) {
    Chart.register(...registerables);
  }

  public ngOnInit(): void {
    this.renderingGraph();
  }

  public ngOnChanges(): void {
    this.getIncomeTimeHistory();
    try {
      this.chart.update();
    } catch {
    }
  }

  public renderingGraph() {
    const data = {
      labels: this.historyIncome.time,
      datasets: [
        {
          label: GRAPH_PROFIT,
          data: this.historyIncome.profitPNL,
          fill: false,
          borderColor: GRAPH_PROFIT_BORDER_COLOR,
          backgroundColor: GRAPH_PROFIT_BACKGROUND_COLOR,
        },
        {
          label: GRAPH_REALIZED_PNL,
          data: this.historyIncome.realizedPNL.value,
          fill: false,
          borderColor: GRAPH_REALIZED_PN_BORDER_COLOR,
          backgroundColor: GRAPH_REALIZED_PN_BACKGROUND_COLOR,
        },
        {
          label: GRAPH_LABEL_COMMISSION,
          data: this.historyIncome.commission.value,
          fill: false,
          borderColor: GRAPH_LABEL_COMMISSION_BORDER_COLOR,
          backgroundColor: GRAPH_LABEL_COMMISSION_BACKGROUND_COLOR,
        },
      ]
    };

    this.chart = new Chart("chart", {
      type: 'line',
      data,
    });
  }

  public getIncomeTimeHistory(): void {
    this.statisticsGraphService.filterIncomeHistory(this.allHistoryIncome);
    const commissionIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.commissionIncomeHistory;
    this.sortForGraphIncomeHistoryСommission(this.statisticsGraphService.filterIncomeType(commissionIncomeHistory));
    const realizedPNLIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.realizedPNLIncomeHistory;
    this.sortForGraphIncomeHistoryRealizedPNL(this.statisticsGraphService.filterIncomeType(realizedPNLIncomeHistory));
    this.sortForGraphIncomeHistoryProfit();
  }

  public sortForGraphIncomeHistoryСommission(incomeHistoryCommission: IIncomeHistoryFilter[]) {
    incomeHistoryCommission.forEach((v: IIncomeHistoryFilter) => {
      this.historyIncome.commission.value.push(v.income);
      this.historyIncome.commission.type = v.incomeType;
      this.historyIncome.time.push(v.date);
    })
  }

  public sortForGraphIncomeHistoryRealizedPNL(incomeHistoryRealizedPNL: IIncomeHistoryFilter[]) {
    incomeHistoryRealizedPNL.forEach(historyIncomeRealizedPNL => {
      this.historyIncome.realizedPNL.value.push(historyIncomeRealizedPNL.income);
      this.historyIncome.realizedPNL.type = historyIncomeRealizedPNL.incomeType;
    })
  }

  public sortForGraphIncomeHistoryProfit() {
    this.historyIncome.commission.value.map((historyIncomeCommission:number, index:number)=> {
      this.historyIncome.profitPNL.push(historyIncomeCommission + this.historyIncome.realizedPNL.value[index] || 0);
    })
  }
}

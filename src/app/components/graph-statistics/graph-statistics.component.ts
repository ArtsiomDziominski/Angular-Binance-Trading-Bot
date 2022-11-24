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

@Component({
  selector: 'app-graph-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph-statistics.component.html',
  styleUrls: ['./graph-statistics.component.css']
})
export class GraphStatisticsComponent implements OnInit, OnChanges {
  @Input() public allIncomeHistories!: IIncomeHistoryFull[];
  @Input() public windowWidth!: number;

  public incomeCommission: number[] = [];
  public incomeTypeCommission: string = '';
  public incomeTimeCommission: string[] = [];

  public incomeRealizedPNL: number[] = [];
  public incomeTypeRealizedPNL: string = '';
  public incomeTimeRealizedPNL: string[] = [];

  public profitPNL: number[] = [];

  public chart!: Chart

  constructor(
    public statisticsGraphService: StatisticsGraphService,
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.renderingGraph();
  }

  ngOnChanges() {
    this.getIncomeTimeHistory();
    try {
      this.chart.update();
    } catch {
    }
  }

  public renderingGraph() {
    const data = {
      labels: this.incomeTimeCommission,
      datasets: [
        {
          label: GRAPH_PROFIT,
          data: this.profitPNL,
          fill: false,
          borderColor: GRAPH_PROFIT_BORDER_COLOR,
          backgroundColor: GRAPH_PROFIT_BACKGROUND_COLOR,
        },
        {
          label: GRAPH_REALIZED_PNL,
          data: this.incomeRealizedPNL,
          fill: false,
          borderColor: GRAPH_REALIZED_PN_BORDER_COLOR,
          backgroundColor: GRAPH_REALIZED_PN_BACKGROUND_COLOR,
        },
        {
          label: GRAPH_LABEL_COMMISSION,
          data: this.incomeCommission,
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
    this.statisticsGraphService.filterIncomeHistory(this.allIncomeHistories);
    const commissionIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.getCommissionIncomeHistory();
    this.sortForGraphIncomeHistoryСommission(this.statisticsGraphService.filterIncomeType(commissionIncomeHistory));
    const realizedPNLIncomeHistory: IIncomeHistory[] = this.statisticsGraphService.getRealizedPNLIncomeHistory();
    this.sortForGraphIncomeHistoryRealizedPNL(this.statisticsGraphService.filterIncomeType(realizedPNLIncomeHistory));
    this.sortForGraphIncomeHistoryProfit();
  }

  public sortForGraphIncomeHistoryСommission(incomeHistoryCommission: IIncomeHistoryFilter[]) {
    incomeHistoryCommission.forEach((v: IIncomeHistoryFilter) => {
      this.incomeCommission.push(v.income);
      this.incomeTypeCommission = v.incomeType;
      this.incomeTimeCommission.push(v.date);
    })
  }

  public sortForGraphIncomeHistoryRealizedPNL(incomeHistoryRealizedPNL: IIncomeHistoryFilter[]) {
    incomeHistoryRealizedPNL.forEach(v => {
      this.incomeRealizedPNL.push(v.income);
      console.log(v)
      this.incomeTypeRealizedPNL = v.incomeType;
      this.incomeTimeRealizedPNL.push(v.date);
    })
  }

  public sortForGraphIncomeHistoryProfit() {
    console.log(this.incomeCommission)
    console.log(this.incomeRealizedPNL)

    for (let i = 0; i < this.incomeCommission.length; i++) {
      this.profitPNL.push(this.incomeCommission[i] + this.incomeRealizedPNL[i] || 0);
    }
  }
}

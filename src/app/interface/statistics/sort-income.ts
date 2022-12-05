export interface ISortIncome {
  time: string[];
  realizedPNL: { type: string, value: number[] };
  commission: { type: string, value: number[] };
  profitPNL: number[]
}

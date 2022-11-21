export interface ICurrenTokens {
  symbol: string;
  entryPrice: string;
  leverage: string;
  liquidationPrice:string;
  markPrice:string;
  positionAmt:string;
  unRealizedProfit:string;
  isAutoAddMargin?: number | string;
  isolatedMargin?: number | string;
  isolatedWallet?: number | string;
  marginType?: number | string;
  maxNotionalValue?: number | string;
  notional?: number | string;
  positionSide?: number | string;
  updateTime?: number | string;
}

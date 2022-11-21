export interface IOpenOrder {
  entryPrice:string;
  isAutoAddMargin:string;
  isolatedMargin:string;
  isolatedWallet:string;
  leverage:string;
  liquidationPrice:string;
  marginType:string;
  markPrice:string;
  maxNotionalValue:string;
  notional:string;
  positionAmt:string | number;
  positionSide:string;
  symbol:string;
  unRealizedProfit:string;
  updateTime:string;
  code?:number;
}

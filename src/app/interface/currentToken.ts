export interface ICurrenTokens {
  symbol: string;
  entryPrice: string;//цена входа
  leverage: string; //плечо
  liquidationPrice:string; //цена ликвидации
  markPrice:string; //текущая цена
  positionAmt:string; //Кол монет
  unRealizedProfit:string; // профит
  isAutoAddMargin?: number | string;
  isolatedMargin?: number | string;
  isolatedWallet?: number | string;
  marginType?: number | string;
  maxNotionalValue?: number | string;
  notional?: number | string;
  positionSide?: number | string;
  updateTime?: number | string;
}

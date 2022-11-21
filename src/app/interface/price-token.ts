export interface IPrice {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string| number;
  closeTime?: number | string;
  count?: number | string;
  firstId?: number | string;
  highPrice?: number | string;
  lastId?: number | string;
  lastQty?: number | string;
  lowPrice?: number | string;
  openPrice?: number | string;
  openTime?: number | string;
  priceChange?: number | string;
  quoteVolume?: number | string;
  volume?: number | string;
  weightedAvgPrice?: number | string;
}

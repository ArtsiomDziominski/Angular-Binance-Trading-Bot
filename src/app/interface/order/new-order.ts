export interface INewOrderParams {
  symbol: string;
  side: string;
  quantityToken: number;
  price: number;
  quantityOrders: number;
  distanceToken: number;
  priceCommaNumbers?: number;
}

export interface IParamSignatureNewOrder {
  signature: string;
  dataQueryString: string;
  akey: string;
}

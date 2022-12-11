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

export interface IInfoOrderCreate {
  orderId: number;
  origQty: string;
  price: string;
  side: string;
  status: string;
  symbol: string;
  updateTime: number;
  workingType: string;
  code?: number | string;
  msg?: string;
}

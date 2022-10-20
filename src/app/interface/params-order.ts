export interface IParamsOrder {
  symbol: string;
  side: number | string;
  quantity: number | undefined;
  price: number;
  quantityOrders: number;
  distanceToken: number;
}

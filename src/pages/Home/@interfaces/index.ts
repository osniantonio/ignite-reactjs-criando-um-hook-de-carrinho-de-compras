import { Product } from "../../@interfaces";

export interface ProductFormatted extends Product {
  priceFormatted: string;
}

export interface CartItemsAmount {
  [key: number]: number;
}

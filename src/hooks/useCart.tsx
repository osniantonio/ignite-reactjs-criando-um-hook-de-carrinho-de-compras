import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";
import { CartIdLocalStorage } from "../util/LocalStorageHelper";
import {
  CartProviderProps,
  UpdateProductAmount,
  ProductAPI,
  CartContextData,
} from "./@interfaces";

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem(CartIdLocalStorage);

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const prevCartRef = useRef<Product[]>();

  useEffect(() => {
    prevCartRef.current = cart;
  })

  const cartPreviousValue = prevCartRef.current ?? cart;

  useEffect(() => {
    if (cartPreviousValue !== cart) {
      localStorage.setItem(CartIdLocalStorage, JSON.stringify(cart));
    }
  }, [cart, cartPreviousValue]);

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const { data: stockData } = await api.get<Stock>(`stock/${productId}`);

      const productExists = updatedCart.find(
        (productCart) => productCart.id === productId
      );

      const amount = productExists ? productExists.amount + 1 : 1;

      if (amount > stockData.amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      // verifica se atualiza ou adiciona um novo produto
      if (productExists) {
        productExists.amount = amount;
      } else {
        const { data: product } = await api.get<ProductAPI>(
          `products/${productId}`
        );
        const newProduct = {
          ...product,
          amount: 1,
        };
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);

      localStorage.setItem(CartIdLocalStorage, JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(
        (product) => product.id === productId
      );
      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
        localStorage.setItem(CartIdLocalStorage, JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const { data: stockData } = await api.get(`/stock/${productId}`);

      if (stockData.amount <= amount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updateProductAmountItens = cart.map((productCart) => {
        if (productCart.id === productId) {
          return {
            ...productCart,
            amount,
          };
        }

        return productCart;
      });

      setCart(updateProductAmountItens);
      localStorage.setItem(CartIdLocalStorage, JSON.stringify(updateProductAmountItens));
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  return useContext(CartContext);
}

import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Product } from "../@interfaces";
import { Container, ProductTable, Total } from "./styles";
import { toast } from "react-toastify";

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const productAmount = (product: Product) =>
    product.amount ? product.amount : 0;

  const cartFormatted = cart.map((product) => ({
    ...product,
    priceFormatted: formatPrice(product.price),
    priceTotal: formatPrice(product.price * productAmount(product)),
  }));

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      return (sumTotal += product.price * productAmount(product));
    }, 0)
  );

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      amount: productAmount(product) + 1,
      productId: product.id,
    });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({
      amount: productAmount(product) - 1,
      productId: product.id,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((product) => (
            <tr data-testid="product" key={product.id}>
              <td>
                <img src={product.image} alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{product.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={productAmount(product) <= 1}
                    onClick={() => handleProductDecrement(product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={productAmount(product)}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{product.priceTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
          {cartFormatted.length === 0 && (
            <tr data-testid="product">
              <td colSpan={5}>O seu carrinho de compras está vazio!</td>
            </tr>
          )}
        </tbody>
      </ProductTable>

      <footer>
        <button
          type="button"
          onClick={() =>
            toast.info("Funcionalidade não implementada no desafio!")
          }
        >
          Finalizar pedido
        </button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;

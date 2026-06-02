// pages/Cart.jsx

import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart } =
    useContext(CartContext);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Shopping Cart
      </h1>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b py-4"
        >
          <h3>{item.name}</h3>

          <div className="flex items-center gap-4">
            <span>${item.price}</span>

            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="mt-8 text-right">
        <h2 className="text-2xl font-bold">
          Total: ${total}
        </h2>
      </div>
    </div>
  );
};

export default Cart;
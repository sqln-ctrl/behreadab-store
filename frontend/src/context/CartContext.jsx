import { createContext, useState } from "react";
export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const addToCart     = (product) => setCartItems(prev => [...prev, product]);
  const removeFromCart = (id) => setCartItems(prev => { const idx = prev.findIndex(i => i.id === id); if (idx === -1) return prev; const updated = [...prev]; updated.splice(idx, 1); return updated; });
  const clearCart     = () => setCartItems([]);
  return <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
};

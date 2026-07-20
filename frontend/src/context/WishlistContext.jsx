import { createContext, useState } from "react";
export const WishlistContext = createContext();
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const toggleWishlist = (product) => setWishlistItems(prev => prev.find(i => i.id === product.id) ? prev.filter(i => i.id !== product.id) : [...prev, product]);
  const isWishlisted   = (id) => wishlistItems.some(i => i.id === id);
  return <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isWishlisted }}>{children}</WishlistContext.Provider>;
};

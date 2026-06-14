import { createContext, useState } from "react";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) =>
      prev.find((i) => i.id === product.id) ? prev : [...prev, product]
    );
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isWishlisted = (id) => wishlistItems.some((i) => i.id === id);

  const toggleWishlist = (product) => {
    isWishlisted(product.id)
      ? removeFromWishlist(product.id)
      : addToWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

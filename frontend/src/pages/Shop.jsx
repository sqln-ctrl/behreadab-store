// pages/Shop.jsx

import { useState } from "react";
import ProductCard from "../components/ProductCard";
import products from "../data/products";

const Shop = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Shop Watches
      </h1>

      <div className="grid md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div>
          <h3 className="font-bold text-xl mb-4">
            Categories
          </h3>

          <ul className="space-y-2">
            <li>Men</li>
            <li>Women</li>
          </ul>
        </div>

        {/* Products */}
        <div className="md:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Shop;
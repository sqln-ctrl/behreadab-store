import React from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ image, name, price }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover"
        />

        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow">
          <FaHeart className="text-gray-600 hover:text-red-500" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-blue-600">
            ${price}
          </span>

          <button className="bg-black text-white p-3 rounded-lg hover:bg-gray-800">
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
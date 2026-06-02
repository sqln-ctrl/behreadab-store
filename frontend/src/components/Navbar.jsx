import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="bg-white text-black px-8 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-bold cursor-pointer">
            WatchStore
          </h1>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-8 font-medium">
          <li>
             <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/shop">Shop</Link>
          </li>
          <li>
            <a href="/about" className="hover:text-gray-300 transition">
              About
            </a>
          </li>
          <li>
            <Link to="/cart">Cart</Link>
          </li>
        </ul>
 
        {/* Search Bar */}
        <div className="hidden lg:flex items-center bg-white rounded-md overflow-hidden">
          <input
            type="text"
            placeholder="Search watches..."
            className="px-3 py-2 text-black outline-none"
            
          />
          <button className="px-3 text-black">
            <FaSearch />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5 text-xl">
          <button className="hover:text-red-500 transition">
            <FaHeart />
          </button>

          <button className="relative hover:text-yellow-400 transition">
            <FaShoppingCart />
            <span className="absolute -top-2 -right-3 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
              0
            </span> 
          </button>

          <button className="hover:text-blue-400 transition">
            <FaUser />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
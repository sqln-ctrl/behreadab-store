import React from "react";
import ProductCard from "./ProductCard";
import FeaturedWatches from "./FeaturedWatches";
import Categories from "./Categories";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center justify-between">
          
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Timeless Elegance
            </h1>

            <p className="mt-6  text-gray-300 text-lg">
              Discover premium watches crafted for style,
              precision, and performance.
            </p>

            <Link to="/shop" className="mt-6 inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200">
              Shop Now
            </Link>
          </div>

          <div className="mt-10 md:mt-0">
            <img
              src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3"
              alt="Luxury Watch"
              className="w-[400px] rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Featured Watches */}
       <FeaturedWatches/>
       <Categories/>
    </>
  );
};

export default Hero;
import React from "react";

const Newsletter = () => {
  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-3xl mx-auto px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Join Our Newsletter
        </h2>

        <p className="text-gray-300 mb-8">
          Get exclusive deals, new arrivals, and special offers
          directly in your inbox.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-black outline-none"
          />

          <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
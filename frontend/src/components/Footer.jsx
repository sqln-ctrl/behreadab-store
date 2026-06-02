import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              WatchStore
            </h2>

            <p className="text-gray-400">
              Discover premium watches designed for style,
              elegance, and precision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white">
                  Home
                </a>
              </li>

              <li>
                <a href="/shop" className="hover:text-white">
                  Shop
                </a>
              </li>

              <li>
                <a href="/about" className="hover:text-white">
                  About Us
                </a>
              </li>

              <li>
                <a href="/contact" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Categories
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/mens" className="hover:text-white">
                  Men's Watches
                </a>
              </li>

              <li>
                <a href="/womens" className="hover:text-white">
                  Women's Watches
                </a>
              </li>

              <li>
                <a href="/luxury" className="hover:text-white">
                  Luxury Watches
                </a>
              </li>

              <li>
                <a href="/smart" className="hover:text-white">
                  Smart Watches
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Follow Us
            </h3>

            <div className="flex gap-4 text-2xl">
              <a
                href="#"
                className="hover:text-pink-500 transition"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                className="hover:text-blue-500 transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                className="hover:text-red-500 transition"
              >
                <FaYoutube />
              </a>

              <a
                href="#"
                className="hover:text-gray-300 transition"
              >
                <FaTiktok />
              </a>
            </div>

            <p className="text-gray-400 mt-6">
              Email: support@watchstore.com
            </p>

            <p className="text-gray-400">
              Phone: +92 300 1234567
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
          <p>
            © {new Date().getFullYear()} WatchStore. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
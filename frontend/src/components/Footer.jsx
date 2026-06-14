import { motion } from "framer-motion";
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black text-white">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Watch<span style={{ color: "#d4af37" }}>Store</span>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Luxury timepieces for every wrist. Crafted with precision, worn with pride.
        </p>
        <div className="flex gap-4 mt-5">
          {[FaInstagram, FaTwitter, FaFacebook, FaYoutube].map((Icon, i) => (
            <motion.a key={i} href="#" whileHover={{ color: "#d4af37", scale: 1.15 }} whileTap={{ scale: 0.9 }}
              className="text-gray-400 text-lg transition">
              <Icon />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-400">Shop</h3>
        <ul className="space-y-2.5">
          {["Men's Watches", "Women's Watches", "New Arrivals", "Sale"].map((l) => (
            <li key={l}>
              <Link to="/shop" className="text-gray-400 text-sm hover:text-white transition">{l}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-400">Company</h3>
        <ul className="space-y-2.5">
          {["About Us", "Contact", "Careers", "Press"].map((l) => (
            <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-white transition">{l}</a></li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-400">Support</h3>
        <ul className="space-y-2.5">
          {["FAQ", "Shipping Policy", "Returns", "Track Order"].map((l) => (
            <li key={l}><a href="#" className="text-gray-400 text-sm hover:text-white transition">{l}</a></li>
          ))}
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 px-5 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
      <span>© 2025 WatchStore. All rights reserved.</span>
      <span>Privacy Policy · Terms of Service</span>
    </div>
  </footer>
);

export default Footer;

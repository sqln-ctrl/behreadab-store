import { motion } from "framer-motion";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black text-white border-t border-white/10">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Brand */}
        <div className="max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter:"invert(1)" }} />
            <h2 className="text-lg font-black" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed">Luxury timepieces for every wrist. Crafted with precision, worn with pride.</p>
          <div className="flex gap-4 mt-4">
            <motion.a href="#" whileHover={{ scale:1.15 }} className="text-white/40 hover:text-white transition text-lg"><FaInstagram /></motion.a>
            <motion.a href="#" whileHover={{ scale:1.15 }} className="text-white/40 hover:text-white transition text-lg"><FaWhatsapp /></motion.a>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Shop</h3>
            <ul className="space-y-2.5">
              <li><Link to="/shop?category=Men" className="text-white/50 text-sm hover:text-white transition">Men's Watches</Link></li>
              <li><Link to="/shop?category=Women" className="text-white/50 text-sm hover:text-white transition">Women's Watches</Link></li>
              <li><Link to="/shop" className="text-white/50 text-sm hover:text-white transition">All Watches</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Help</h3>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className="text-white/50 text-sm hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/profile" className="text-white/50 text-sm hover:text-white transition">My Orders</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 px-5 md:px-8 py-4 text-center text-xs text-white/20">
      © {new Date().getFullYear()} Andaaz. All rights reserved.
    </div>
  </footer>
);

export default Footer;

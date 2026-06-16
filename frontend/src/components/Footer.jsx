import { motion } from "framer-motion";
import { FaInstagram, FaTwitter, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-black text-white border-t border-white/10">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.jpg" alt="Andaaz" className="h-10 w-10 rounded-full object-cover" style={{ filter: "invert(1)" }} />
          <h2 className="text-xl font-black" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</h2>
        </div>
        <p className="text-white/40 text-sm leading-relaxed">
          Luxury timepieces for every wrist. Crafted with precision, worn with pride.
        </p>
        <div className="flex gap-4 mt-5">
          {[
            { icon: <FaInstagram />, href: "#" },
            { icon: <FaWhatsapp />, href: "#" },
            { icon: <FaFacebook />, href: "#" },
            { icon: <FaTwitter />, href: "#" },
          ].map((s, i) => (
            <motion.a key={i} href={s.href}
              whileHover={{ color: "#fff", scale: 1.15 }} whileTap={{ scale: 0.9 }}
              className="text-white/40 text-lg transition">
              {s.icon}
            </motion.a>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Shop</h3>
        <ul className="space-y-2.5">
          {["Men's Watches", "Women's Watches", "New Arrivals", "Sale"].map((l) => (
            <li key={l}>
              <Link to="/shop" className="text-white/50 text-sm hover:text-white transition">{l}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Company</h3>
        <ul className="space-y-2.5">
          {["About Us", "Contact", "Careers", "Press"].map((l) => (
            <li key={l}><a href="#" className="text-white/50 text-sm hover:text-white transition">{l}</a></li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Support</h3>
        <ul className="space-y-2.5">
          {["FAQ", "Shipping Policy", "Returns", "Track Order"].map((l) => (
            <li key={l}><a href="#" className="text-white/50 text-sm hover:text-white transition">{l}</a></li>
          ))}
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 px-5 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/30">
      <span>© 2025 Andaaz. All rights reserved.</span>
      <span>Privacy Policy · Terms of Service</span>
    </div>
  </footer>
);

export default Footer;

import { motion } from "framer-motion";
import { FaInstagram, FaWhatsapp, FaFacebook, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = "923146063795";
const PHONE_DISPLAY   = "+92 314 6063795";
const INSTAGRAM_URL   = "https://www.instagram.com/andaaz.ba";
const FACEBOOK_URL    = "https://www.facebook.com/profile.php?id=61590810473613";

const Footer = () => (
  <footer className="bg-black text-white border-t border-white/10">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.jpg" alt="Andaaz" className="h-9 w-9 rounded-full object-cover" style={{ filter:"invert(1)" }} />
            <h2 className="text-lg font-black" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</h2>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Luxury timepieces for every wrist. Crafted with precision, worn with pride.
          </p>

          {/* Social links */}
          <div className="flex gap-3">
            <motion.a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
              whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-green-400 hover:bg-green-500/10 transition"
              title="WhatsApp">
              <FaWhatsapp className="text-lg" />
            </motion.a>
            <motion.a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
              whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-pink-400 hover:bg-pink-500/10 transition"
              title="Instagram">
              <FaInstagram className="text-lg" />
            </motion.a>
            <motion.a href={FACEBOOK_URL} target="_blank" rel="noreferrer"
              whileHover={{ scale:1.12 }} whileTap={{ scale:0.9 }}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition"
              title="Facebook">
              <FaFacebook className="text-lg" />
            </motion.a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Shop</h3>
          <ul className="space-y-2.5">
            <li><Link to="/shop?category=Men"   className="text-white/50 text-sm hover:text-white transition">Men's Watches</Link></li>
            <li><Link to="/shop?category=Women" className="text-white/50 text-sm hover:text-white transition">Women's Watches</Link></li>
            <li><Link to="/shop"                className="text-white/50 text-sm hover:text-white transition">All Watches</Link></li>
            <li><Link to="/cart"                className="text-white/50 text-sm hover:text-white transition">My Cart</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Account</h3>
          <ul className="space-y-2.5">
            <li><Link to="/profile" className="text-white/50 text-sm hover:text-white transition">My Profile</Link></li>
            <li><Link to="/orders"  className="text-white/50 text-sm hover:text-white transition">My Orders</Link></li>
            <li><Link to="/login"   className="text-white/50 text-sm hover:text-white transition">Sign In</Link></li>
            <li><Link to="/register" className="text-white/50 text-sm hover:text-white transition">Create Account</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest mb-4 text-white/40">Contact Us</h3>
          <ul className="space-y-3">
            <li>
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g,"")}`}
                className="flex items-center gap-2.5 text-white/50 hover:text-white transition group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition flex-shrink-0">
                  <FaPhone className="text-xs" />
                </span>
                <span className="text-sm">{PHONE_DISPLAY}</span>
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-white/50 hover:text-green-400 transition group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-green-500/10 transition flex-shrink-0">
                  <FaWhatsapp className="text-xs" />
                </span>
                <span className="text-sm">WhatsApp Us</span>
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 text-white/50 hover:text-pink-400 transition group">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition flex-shrink-0">
                  <FaInstagram className="text-xs" />
                </span>
                <span className="text-sm">@andaaz.ba</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10 px-5 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/20">
      <span>© {new Date().getFullYear()} Andaaz. All rights reserved.</span>
      <span>Privacy Policy · Terms of Service</span>
    </div>
  </footer>
);

export default Footer;

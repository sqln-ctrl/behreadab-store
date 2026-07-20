import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(name, email, password); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-16">
      <motion.div className="w-full max-w-sm" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Andaaz" className="h-14 w-14 rounded-full object-cover mx-auto mb-3" style={{ filter:"invert(1)" }} />
          <h1 className="text-2xl font-black text-white" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</h1>
        </div>
        <h2 className="text-3xl font-black text-white mb-1">Create account</h2>
        <p className="text-white/40 mb-7 text-sm">Join Andaaz today</p>
        {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">{error}</motion.div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ icon:<FaUser />, label:"Full Name", value:name, set:setName, type:"text", placeholder:"Ali Khan" }, { icon:<FaEnvelope />, label:"Email", value:email, set:setEmail, type:"email", placeholder:"you@example.com" }, { icon:<FaLock />, label:"Password", value:password, set:setPassword, type:"password", placeholder:"Min 6 characters" }].map(({ icon, label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">{label}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{icon}</span>
                <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20" />
              </div>
            </div>
          ))}
          <motion.button type="submit" disabled={loading} whileTap={{ scale:0.98 }}
            className="w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-widest mt-2 disabled:opacity-60 bg-white hover:bg-gray-100 transition">
            {loading ? "Creating..." : "Create Account"}
          </motion.button>
        </form>
        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account? <Link to="/login" className="font-bold text-white">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;

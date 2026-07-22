import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-16">
      <motion.div className="w-full max-w-sm" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Andaaz" className="h-14 w-14 rounded-full object-cover mx-auto mb-3" style={{ filter:"invert(1)" }} />
          <h1 className="text-2xl font-black text-white" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</h1>
        </div>
        <h2 className="text-3xl font-black text-white mb-1">Welcome back</h2>
        <p className="text-white/40 mb-7 text-sm">Sign in to your account</p>
        {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">{error}</motion.div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <motion.button type="submit" disabled={loading} whileTap={{ scale:0.98 }}
            className="w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-widest mt-2 disabled:opacity-60 bg-white hover:bg-gray-100 transition">
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account? <Link to="/register" className="font-bold text-white">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;

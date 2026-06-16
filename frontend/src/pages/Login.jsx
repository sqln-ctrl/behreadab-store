import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left decorative */}
      <motion.div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=85" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 100%)" }} />
        <div className="relative text-white text-center px-12 z-10">
          <img src="/logo.jpg" alt="Andaaz" className="h-20 w-20 rounded-full object-cover mx-auto mb-5" style={{ filter: "invert(1)" }} />
          <h1 className="text-5xl font-black mb-3" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</h1>
          <p className="text-white/50 text-lg" style={{ fontFamily: "'Georgia', serif" }}>اندازِ وقت</p>
        </div>
      </motion.div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

          <div className="lg:hidden text-center mb-10">
            <img src="/logo.jpg" alt="Andaaz" className="h-14 w-14 rounded-full object-cover mx-auto mb-3" style={{ filter: "invert(1)" }} />
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>Andaaz</h1>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
          <p className="text-white/40 mb-8">Sign in to your account</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20" />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <motion.button onClick={handleSubmit} disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-widest mt-2 disabled:opacity-60 bg-white hover:bg-gray-100 transition">
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-white hover:text-white/70 transition">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

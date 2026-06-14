import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name || !form.email || !form.password) return setError("All fields required");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      // Supabase sends a verification email
      setSuccess("Account created! Check your email to verify, then sign in.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",    label: "Full Name",        type: "text",                             icon: <FaUser />,     placeholder: "John Doe" },
    { key: "email",   label: "Email",             type: "email",                            icon: <FaEnvelope />, placeholder: "you@example.com" },
    { key: "password",label: "Password",          type: showPass ? "text" : "password",    icon: <FaLock />,     placeholder: "Min 6 characters", toggle: true },
    { key: "confirm", label: "Confirm Password",  type: showPass ? "text" : "password",    icon: <FaLock />,     placeholder: "Repeat password" },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
      >
        <img src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=85" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(0,0,0,0.8) 0%,rgba(212,175,55,0.15) 100%)" }} />
        <div className="relative text-white text-center px-12 z-10">
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Georgia',serif" }}>
            Watch<span style={{ color: "#d4af37" }}>Store</span>
          </h1>
          <p className="text-gray-300 text-lg">Join thousands of watch enthusiasts.</p>
        </div>
      </motion.div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <motion.div className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Georgia',serif" }}>
              Watch<span style={{ color: "#d4af37" }}>Store</span>
            </h1>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Create account</h2>
          <p className="text-gray-400 mb-8">Start your journey with us</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-6">
              {success}
              <Link to="/login" className="block mt-2 font-bold underline">Go to Sign In →</Link>
            </motion.div>
          )}

          {!success && (
            <div className="space-y-4">
              {fields.map(({ key, label, type, icon, placeholder, toggle }) => (
                <div key={key}>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{icon}</span>
                    <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-yellow-500/50 transition placeholder-gray-600" />
                    {toggle && (
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <motion.button onClick={handleSubmit} disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-widest mt-2 disabled:opacity-60"
                style={{ background: "#d4af37" }}>
                {loading ? "Creating account..." : "Create Account"}
              </motion.button>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{" "}
            <Link to="/login" className="font-bold hover:text-white transition" style={{ color: "#d4af37" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

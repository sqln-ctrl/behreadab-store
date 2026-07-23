import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import { authAPI } from "../services/api";

const Register = () => {
  const [step,     setStep]    = useState("form"); // form | otp
  const [userId,   setUserId]  = useState(null);
  const [password, setPassword] = useState(""); // keep for auto-login after OTP
  const [name,     setName]    = useState("");
  const [email,    setEmail]   = useState("");
  const [otp,      setOtp]     = useState(["","","","","",""]);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [resending,setResending]=useState(false);
  const { login } = useAuth();
  const navigate   = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      if (data.requiresOTP) { setUserId(data.userId); setStep("otp"); }
      else { await login(email, password); navigate("/"); }
    } catch (err) { setError(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) document.getElementById(`otp-${index+1}`)?.focus();
    // Auto-submit when all filled
    if (newOtp.every(d => d) && newOtp.join("").length === 6) handleVerifyOTP(newOtp.join(""));
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index-1}`)?.focus();
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    const code = otpValue || otp.join("");
    if (code.length !== 6) return setError("Enter all 6 digits");
    setError(""); setLoading(true);
    try {
      await authAPI.verifyOTP({ userId, otp: code });
      // Log in after verification
      await login(email, password);
      navigate("/");
    } catch (err) { setError(err.response?.data?.message || "Invalid OTP"); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try { await authAPI.resendOTP({ userId }); setOtp(["","","","","",""]); setError(""); }
    catch (err) { setError(err.response?.data?.message || "Failed to resend"); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-16">
      <motion.div className="w-full max-w-sm" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Andaaz" className="h-14 w-14 rounded-full object-cover mx-auto mb-3" style={{ filter:"invert(1)" }}/>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily:"'Georgia', serif" }}>Andaaz</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Registration form ── */}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h2 className="text-3xl font-black text-white mb-1">Create account</h2>
              <p className="text-white/40 mb-7 text-sm">Join Andaaz today</p>

              {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">{error}</motion.div>}

              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { icon:<FaUser/>,     label:"Full Name", value:name,     set:setName,     type:"text",     placeholder:"Ali Khan" },
                  { icon:<FaEnvelope/>, label:"Email",     value:email,    set:setEmail,    type:"email",    placeholder:"you@example.com" },
                  { icon:<FaLock/>,     label:"Password",  value:password, set:setPassword, type:"password", placeholder:"Min 6 characters" },
                ].map(({ icon, label, value, set, type, placeholder }) => (
                  <div key={label}>
                    <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">{label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{icon}</span>
                      <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-white/30 transition placeholder-white/20"/>
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
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === "otp" && (
            <motion.div key="otp" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-white text-2xl"/>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Verify your email</h2>
                <p className="text-white/40 text-sm">We sent a 6-digit code to</p>
                <p className="text-white font-bold text-sm mt-1">{email}</p>
              </div>

              {error && <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 text-center">{error}</motion.div>}

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                    value={digit} onChange={e=>handleOTPChange(i, e.target.value)}
                    onKeyDown={e=>handleOTPKeyDown(i, e)}
                    maxLength={1}
                    className="w-11 h-14 text-center text-xl font-black bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-white/50 transition"
                    style={{ caretColor:"white" }}/>
                ))}
              </div>

              <motion.button onClick={() => handleVerifyOTP()} disabled={loading || otp.join("").length < 6} whileTap={{ scale:0.98 }}
                className="w-full py-4 rounded-xl font-bold text-black text-sm uppercase tracking-widest disabled:opacity-40 bg-white hover:bg-gray-100 transition">
                {loading ? "Verifying..." : "Verify Email"}
              </motion.button>

              <div className="text-center mt-5 space-y-2">
                <p className="text-white/40 text-sm">Didn't receive the code?</p>
                <motion.button onClick={handleResend} disabled={resending} whileTap={{ scale:0.97 }}
                  className="text-white text-sm font-bold underline disabled:opacity-40">
                  {resending ? "Sending..." : "Resend OTP"}
                </motion.button>
              </div>

              <div className="text-center mt-4">
                <button onClick={() => { setStep("form"); setError(""); }} className="text-white/30 text-xs hover:text-white/60 transition">
                  ← Change email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;

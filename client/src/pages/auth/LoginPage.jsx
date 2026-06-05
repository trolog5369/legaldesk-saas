import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { Scale, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, clearError, selectUser, selectIsLoading, selectAuthError } from '../../store/slices/authSlice';

const roleRedirectMap = {
  admin: "/admin/dashboard",
  lawyer: "/lawyer/dashboard",
  client: "/client/dashboard",
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const authError = useSelector(selectAuthError);

  useEffect(() => {
    if (user && user.role) {
      navigate(roleRedirectMap[user.role]);
    }
  }, [user]);

  const handleChange = (e) => {
    if (authError) {
      dispatch(clearError());
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    dispatch(loginUser({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      
      {/* LEFT PANEL — 3D IMMERSIVE FRAME */}
      <div className="hidden lg:block lg:w-[55%] h-screen bg-[#1E293B] relative">
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative w-full h-full">
            <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="w-full h-full" />
            
            {/* Overlay Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[#1E293B]/40" />

            {/* Brand Lockup */}
            <motion.div 
              className="absolute bottom-10 left-10 pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <h1 className="text-white text-3xl font-bold tracking-tight">LegalDesk</h1>
              <p className="text-slate-400 text-sm mt-1">The complete operating system for your firm.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL — AUTH FORM */}
      <div className="flex-1 h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6">
        <motion.div
          className="bg-white border border-[#E2E8F0] rounded-2xl shadow-lg p-8 w-full max-w-[420px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        >
          {/* Card Header */}
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-[#1D4ED8]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Welcome back</h2>
          <p className="text-sm text-[#64748B] mt-1 mb-8">Sign in to LegalDesk</p>

          {/* Form Fields Group */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Email address
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@lawfirm.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#64748B]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Error Display */}
            {authError && (
              <div className="mt-3 px-4 py-2.5 bg-red-500/10 border-l-4 border-red-500 rounded-md text-xs text-red-600 font-medium">
                {authError}
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Link */}
        <p className="text-center text-sm text-[#64748B] mt-6">
          New client? <Link to="/register" className="text-[#1D4ED8] font-semibold hover:underline">Request access</Link>
        </p>
      </div>

    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spline from '@splinetool/react-spline';
import api from '../../services/api';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// TODO: Replace with a valid Spline scene URL in production env
const SPLINE_SCENE_URL = import.meta.env.VITE_SPLINE_SCENE || '';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      // Dispatch to Redux authSlice
      dispatch({ 
        type: 'auth/loginUser/fulfilled', 
        payload: { user, accessToken } 
      });

      // Redirect based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'lawyer') navigate('/lawyer/dashboard');
      else if (user.role === 'client') navigate('/client/dashboard');
      else navigate('/login');

    } catch (err) {
      console.error("AXIOS ERROR DETAILS:", err.response || err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen flex w-full font-inter"
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E293B] relative overflow-hidden items-center justify-center">
        {SPLINE_SCENE_URL && (
          <div className="absolute inset-0 z-0">
            <Spline scene={SPLINE_SCENE_URL} />
          </div>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">LegalDesk</h1>
          <p className="text-slate-400 text-center max-w-sm">
            Secure, AI-powered management for modern legal practices.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-[#1E293B]">{t('login.title')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('login.email')}</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('login.password')}</label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.loading')}
                </>
              ) : (
                t('login.submit')
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}

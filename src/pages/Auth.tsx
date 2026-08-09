import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Chrome, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

export const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const isSignUp = location.pathname === '/signup';

  usePageTitle(isSignUp ? 'Sign Up' : 'Sign In');
  const [method, setMethod] = useState<'selection' | 'email'>('selection');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        navigate('/onboarding');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center p-6 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8FF4D]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Spacing below navbar: Mobile 32-48px, Tablet 48-64px, Desktop 64-96px */}
      <div className="w-full pt-[80px] sm:pt-[128px] lg:pt-[160px] pb-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center relative z-10"
        >
          {/* Brand & Heading Group */}
          <div className="text-center w-full max-w-2xl px-4">
            <Link to="/" className="text-xl sm:text-3xl font-black tracking-tighter text-white inline-block mb-5 sm:mb-6">
              SUB<span className="text-[#B8FF4D]">TEEN</span>
            </Link>
            
            <h1 className="text-[28px] sm:text-[42px] lg:text-[52px] font-black text-white tracking-tight leading-tight mb-3 sm:mb-4">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            
            <p className="text-[15px] sm:text-[18px] lg:text-[20px] text-zinc-500 font-medium mb-8 sm:mb-10">
              Join the premium gaming destination.
            </p>
          </div>

          {/* Auth Card: Mobile max-340px, Tablet 400px, Desktop 440-480px */}
          <div className="w-[calc(100%-32px)] max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] bg-zinc-950 border border-white/5 rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-12 shadow-2xl mb-6">
            <AnimatePresence mode="wait">
              {method === 'selection' ? (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3 sm:space-y-4"
                >
                  <button 
                    onClick={() => setMethod('email')}
                    className="w-full group flex items-center justify-between h-[56px] sm:h-[68px] lg:h-[76px] px-4 sm:px-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-[#B8FF4D] transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-zinc-400 group-hover:text-[#B8FF4D] transition-colors shrink-0">
                        <Mail className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className="font-bold text-white text-[15px] sm:text-[16px] lg:text-[20px] whitespace-nowrap">Continue with Email</span>
                    </div>
                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-zinc-700 group-hover:text-[#B8FF4D] shrink-0" />
                  </button>

                  <button 
                    onClick={handleGoogle}
                    disabled={submitting}
                    className="w-full group flex items-center justify-between h-[56px] sm:h-[68px] lg:h-[76px] px-4 sm:px-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-[#B8FF4D] transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-zinc-400 group-hover:text-[#B8FF4D] transition-colors shrink-0">
                        <Chrome className="w-5 h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className="font-bold text-white text-[15px] sm:text-[16px] lg:text-[20px] whitespace-nowrap">Continue with Google</span>
                    </div>
                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-zinc-700 group-hover:text-[#B8FF4D] shrink-0" />
                  </button>

                  <div className="pt-6 sm:pt-8 text-center">
                    <p className="text-[14px] lg:text-[16px] text-zinc-500 font-medium">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <Link 
                        to={isSignUp ? '/signin' : '/signup'} 
                        className="text-[#B8FF4D] font-black hover:underline ml-1"
                      >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="email"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <button 
                    onClick={() => setMethod('selection')}
                    className="flex items-center gap-2 text-[11px] sm:text-[12px] font-black text-zinc-500 hover:text-white uppercase tracking-widest mb-4 sm:mb-6"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {isSignUp && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full h-[56px] bg-zinc-900 border border-zinc-800 rounded-2xl px-5 text-white text-[15px] sm:text-[16px] focus:outline-none focus:border-[#B8FF4D] transition-colors"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-[56px] bg-zinc-900 border border-zinc-800 rounded-2xl px-5 text-white text-[15px] sm:text-[16px] focus:outline-none focus:border-[#B8FF4D] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Password</label>
                        {!isSignUp && <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Forgot?</button>}
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-[56px] bg-zinc-900 border border-zinc-800 rounded-2xl px-5 text-white text-[15px] sm:text-[16px] focus:outline-none focus:border-[#B8FF4D] transition-colors"
                      />
                    </div>
                    <button disabled={submitting} className="w-full bg-[#B8FF4D] text-black h-[56px] sm:h-[68px] lg:h-[76px] rounded-[24px] font-black text-[16px] lg:text-[20px] hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10 mt-4 sm:mt-6 disabled:opacity-50">
                      {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                    {error && (
                      <p className="text-xs text-red-400 font-medium text-center pt-2">{error}</p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.2em] max-w-[280px] mx-auto leading-relaxed pt-4 sm:pt-8">
            By continuing, you agree to Subteen's <br />
            <a href="#" className="text-zinc-500 hover:text-white underline">Terms of Service</a> and <a href="#" className="text-zinc-500 hover:text-white underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

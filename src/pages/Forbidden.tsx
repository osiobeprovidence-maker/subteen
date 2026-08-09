import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const Forbidden = () => {
  const location = useLocation();

  usePageTitle('Access Denied');

  return (
    <div className="min-h-screen pt-40 pb-32 px-4 sm:px-6 flex items-start justify-center">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert size={36} className="text-red-500" />
        </div>
        <div className="space-y-3">
          <h1 className="text-6xl font-black text-white tracking-tighter">403</h1>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Access Forbidden</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Your account doesn&apos;t have permission to view this page. The route
            <span className="text-zinc-300 font-bold"> {location.pathname} </span>
            is restricted to users with a specific role.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#B8FF4D] transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-zinc-300 border border-white/5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

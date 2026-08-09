import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, ArrowRight, Gamepad2, Sword, Trophy, Zap, Ghost, Music } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const CATEGORIES = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-orange-500' },
  { id: 'rpg', name: 'RPG', icon: Sword, color: 'bg-purple-500' },
  { id: 'esports', name: 'Esports', icon: Trophy, color: 'bg-[#B8FF4D]' },
  { id: 'indie', name: 'Indie', icon: Ghost, color: 'bg-blue-500' },
  { id: 'mmo', name: 'MMO', icon: Gamepad2, color: 'bg-pink-500' },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-yellow-500' },
];

export const Onboarding = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  usePageTitle('Welcome');

  const toggleCategory = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8FF4D]/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-12 text-center relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-[42px] sm:text-[56px] font-black text-white tracking-tight leading-[1.1]">
            Pick your <span className="text-[#B8FF4D]">Interests</span>
          </h1>
          <p className="text-zinc-500 text-lg sm:text-xl font-medium max-w-md mx-auto">
            Choose at least 3 categories to personalize your gaming feed.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id);
            const Icon = cat.icon;
            
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`group relative p-8 rounded-[32px] border transition-all duration-300 text-left overflow-hidden ${
                  isSelected 
                    ? 'bg-white border-white scale-[0.98]' 
                    : 'bg-zinc-950 border-white/5 hover:border-[#B8FF4D]/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected ? 'bg-black text-white' : 'bg-zinc-900 text-zinc-400 group-hover:text-white'
                }`}>
                  <Icon size={24} />
                </div>
                
                <span className={`text-xl font-black transition-colors ${
                  isSelected ? 'text-black' : 'text-white'
                }`}>
                  {cat.name}
                </span>

                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 w-6 h-6 bg-black rounded-full flex items-center justify-center"
                  >
                    <Check size={14} className="text-[#B8FF4D]" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-8">
          <button 
            disabled={selected.length < 3}
            onClick={handleFinish}
            className={`group flex items-center gap-4 px-12 py-6 rounded-full font-black text-xl transition-all ${
              selected.length >= 3 
                ? 'bg-[#B8FF4D] text-black hover:bg-white' 
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Continue 
            <ArrowRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
              selected.length >= 3 ? 'text-black' : 'text-zinc-700'
            }`} />
          </button>
          
          <p className="mt-6 text-zinc-600 font-bold uppercase tracking-widest text-xs">
            {selected.length} / 3 selected
          </p>
        </div>
      </motion.div>
    </div>
  );
};

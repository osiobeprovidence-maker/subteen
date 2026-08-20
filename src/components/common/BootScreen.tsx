import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';

const MIN_SPLASH_MS = 900;
const FADE_MS = 500;

export const BootScreen = () => {
  const { loading } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  const visible = loading || !minElapsed;

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setGone(true), FADE_MS);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#0A0A0A] transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="animate-pulse motion-reduce:animate-none">
        <BrandLogo variant="icon" className="h-16 w-16 drop-shadow-[0_0_24px_rgba(184,255,77,0.35)]" />
      </div>
      <span className="font-black tracking-tighter text-3xl text-white">
        SUB<span className="text-[#B8FF4D]">TEEN</span>
      </span>
      <div className="h-0.5 w-36 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-2/5 rounded-full bg-[#B8FF4D] animate-[boot-sweep_1.1s_ease-in-out_infinite] motion-reduce:animate-none" />
      </div>
      <span className="text-[11px] uppercase tracking-[0.35em] text-white/40">Loading</span>
      <style>{`@keyframes boot-sweep{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}`}</style>
    </div>
  );
};

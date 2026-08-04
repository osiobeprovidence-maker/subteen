import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, Facebook, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/" className="text-3xl font-black tracking-tighter text-white">
              SUB<span className="text-[#B8FF4D]">TEEN</span>
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-xs">
              The premium destination for gaming news, expert reviews, and in-depth culture. No fluff, just gaming.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-[#B8FF4D] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-[#B8FF4D] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-[#B8FF4D] transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-[#B8FF4D] transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platforms</h4>
            <ul className="space-y-4">
              <li><Link to="/category/pc" className="text-zinc-400 hover:text-white transition-colors">PC Gaming</Link></li>
              <li><Link to="/category/playstation" className="text-zinc-400 hover:text-white transition-colors">PlayStation</Link></li>
              <li><Link to="/category/xbox" className="text-zinc-400 hover:text-white transition-colors">Xbox</Link></li>
              <li><Link to="/category/nintendo" className="text-zinc-400 hover:text-white transition-colors">Nintendo</Link></li>
              <li><Link to="/category/mobile" className="text-zinc-400 hover:text-white transition-colors">Mobile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/category/news" className="text-zinc-400 hover:text-white transition-colors">Latest News</Link></li>
              <li><Link to="/category/reviews" className="text-zinc-400 hover:text-white transition-colors">Game Reviews</Link></li>
              <li><Link to="/category/guides" className="text-zinc-400 hover:text-white transition-colors">Guides & Tips</Link></li>
              <li><Link to="/category/esports" className="text-zinc-400 hover:text-white transition-colors">Esports</Link></li>
              <li><Link to="/category/deals" className="text-zinc-400 hover:text-white transition-colors">Best Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-zinc-400 mb-6">Get the day's biggest stories delivered to your inbox.</p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-[#B8FF4D] text-black px-4 rounded-lg font-bold flex items-center gap-2 hover:bg-white transition-colors">
                <Mail size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <p>© 2024 SUBTEEN. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

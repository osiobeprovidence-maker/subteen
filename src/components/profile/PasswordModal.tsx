import React, { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const PasswordModal = ({ open, onClose }: PasswordModalProps) => {
  const { hasPassword, addPassword, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      if (hasPassword) {
        await changePassword(currentPassword, newPassword);
      } else {
        await addPassword(newPassword);
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Your current password is incorrect.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <Lock size={18} />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {hasPassword && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
              {hasPassword ? 'New Password' : 'Password'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors"
            />
          </div>

          {!hasPassword && (
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">
              Add a password so you can sign in with email too. You can keep using Google anytime.
            </p>
          )}

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
          {success && (
            <p className="flex items-center gap-2 text-xs text-[#B8FF4D] font-medium">
              <Check size={14} /> {hasPassword ? 'Password updated.' : 'Password set — you can now sign in with email and password.'}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/20 disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : hasPassword ? 'Update Password' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

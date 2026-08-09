import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Save, Check, Loader2, SlidersHorizontal } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';

const FREQUENCY_OPTIONS = [
  { value: 5, label: 'Every 5 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 360, label: 'Every 6 hours' },
  { value: 720, label: 'Every 12 hours' },
  { value: 1440, label: 'Daily' },
];

const AUTO_APPROVE_DELAY_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 360, label: '6 hours' },
  { value: 1440, label: '24 hours' },
];

export const AutomationSettings = () => {
  const settings = useQuery(api.newsAutomation.settings);
  const updateSettings = useMutation(api.newsAutomation.updateSettings);

  const [syncFrequencyMinutes, setSyncFrequencyMinutes] = useState(15);
  const [autoPublish, setAutoPublish] = useState(false);
  const [trustedSources, setTrustedSources] = useState<string[]>([]);
  const [trustedCategories, setTrustedCategories] = useState<string[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoApproveDelayMinutes, setAutoApproveDelayMinutes] = useState(30);
  const [maxStoriesPerSync, setMaxStoriesPerSync] = useState(20);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setSyncFrequencyMinutes(settings.syncFrequencyMinutes ?? 15);
    setAutoPublish(settings.autoPublish ?? false);
    setTrustedSources(settings.trustedSources ?? []);
    setTrustedCategories(settings.trustedCategories ?? []);
    setAutoApprove(settings.autoApprove ?? false);
    setAutoApproveDelayMinutes(settings.autoApproveDelayMinutes ?? 30);
    setMaxStoriesPerSync(settings.maxStoriesPerSync ?? 20);
  }, [settings]);

  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        syncFrequencyMinutes,
        autoPublish,
        trustedSources,
        trustedCategories,
        autoApprove,
        autoApproveDelayMinutes,
        maxStoriesPerSync,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors';
  const labelClass = 'text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block';
  const cardClass = 'bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-8';

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Automation Settings</h2>
            <p className="text-xs text-zinc-500 mt-1">Sync cadence and automatic publishing rules.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>

      <div className={cardClass}>
        <div className="space-y-2">
          <label className={labelClass}>Sync Frequency</label>
          <select
            value={syncFrequencyMinutes}
            onChange={(e) => setSyncFrequencyMinutes(Number(e.target.value))}
            className={cn(inputClass, 'appearance-none cursor-pointer')}
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest pt-1">How often the ingester checks all active RSS feeds for new stories.</p>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Max Stories Per Sync</label>
          <input
            type="number"
            min={1}
            max={100}
            value={maxStoriesPerSync}
            onChange={(e) => setMaxStoriesPerSync(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Automatic Publishing</h3>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Auto-publish AI drafts from trusted sources/categories, bypassing review.</p>
            </div>
            <button
              onClick={() => setAutoPublish(!autoPublish)}
              className={cn(
                'relative w-14 h-8 rounded-full transition-all',
                autoPublish ? 'bg-[#B8FF4D]' : 'bg-zinc-800',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-6 h-6 rounded-full transition-all',
                  autoPublish ? 'left-7 bg-black' : 'left-1 bg-zinc-500',
                )}
              />
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Disabled by default — all drafts go to editorial review. When enabled, drafts matching a trusted source or category are published immediately with source attribution.
          </p>
        </div>

        {autoPublish && (
          <div className="space-y-8 pt-2">
            <div className="space-y-3">
              <label className={labelClass}>Trusted Sources</label>
              <div className="flex flex-wrap gap-2">
                {(settings?.knownSources ?? []).map((name) => (
                  <button
                    key={name}
                    onClick={() => setTrustedSources(toggleInList(trustedSources, name))}
                    className={cn(
                      'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      trustedSources.includes(name)
                        ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className={labelClass}>Trusted Categories</label>
              <div className="flex flex-wrap gap-2">
                {(settings?.knownCategories ?? []).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTrustedCategories(toggleInList(trustedCategories, cat))}
                    className={cn(
                      'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      trustedCategories.includes(cat)
                        ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cardClass}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Time-Based Auto-Approval</h3>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">Publish every AI draft automatically after a delay.</p>
            </div>
            <button
              onClick={() => setAutoApprove(!autoApprove)}
              className={cn(
                'relative w-14 h-8 rounded-full transition-all',
                autoApprove ? 'bg-[#B8FF4D]' : 'bg-zinc-800',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-6 h-6 rounded-full transition-all',
                  autoApprove ? 'left-7 bg-black' : 'left-1 bg-zinc-500',
                )}
              />
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            When enabled, every AI-generated draft is published automatically after the configured delay, giving you a window to intervene. A check runs every minute.
          </p>
        </div>

        {autoApprove && (
          <div className="space-y-3 pt-2">
            <label className={labelClass}>Auto-Publish Delay</label>
            <select
              value={autoApproveDelayMinutes}
              onChange={(e) => setAutoApproveDelayMinutes(Number(e.target.value))}
              className={cn(inputClass, 'appearance-none cursor-pointer')}
            >
              {AUTO_APPROVE_DELAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest pt-1">
              Drafts are published this long after they were created. Reject or edit them before the window closes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

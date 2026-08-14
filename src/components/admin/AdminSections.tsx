import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Layers, FileText, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import { sectionPath, type EditorialSectionRow } from '../../lib/sections';

type SectionWithId = EditorialSectionRow & { _id: string };

export const AdminSections = () => {
  const sections = useQuery(api.editorialSections.list) as SectionWithId[] | undefined;
  const counts = useQuery(api.editorialSections.publishedCounts) as Record<string, number> | undefined;
  const ensureSections = useMutation(api.editorialSections.ensureSections);
  const setActive = useMutation(api.editorialSections.setActive);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    ensureSections();
  }, [ensureSections]);

  const handleToggle = async (section: SectionWithId) => {
    setToggling(section.slug);
    try {
      await setActive({ id: section._id as any, active: !section.active });
    } finally {
      setToggling(null);
    }
  };

  const activeCount = (sections ?? []).filter((s) => s.active).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
            <Layers size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">Editorial Sections</h3>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
              {sections ? `${activeCount} of ${sections.length} sections visible in the public header` : 'Loading…'}
            </p>
          </div>
        </div>
        <button
          onClick={() => ensureSections()}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/10 transition-all"
        >
          <RefreshCw size={14} /> Ensure Defaults
        </button>
      </div>

      {!sections ? (
        <div className="flex items-center justify-center gap-3 py-32 text-zinc-600 text-xs font-black uppercase tracking-widest">
          <Loader2 size={18} className="animate-spin" /> Loading sections…
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          {(sections as SectionWithId[]).map((section, i) => {
            const published = counts?.[section.name] ?? 0;
            const isToggling = toggling === section.slug;
            return (
              <div
                key={section._id}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-6 sm:px-8 py-6 transition-colors',
                  i !== sections.length - 1 && 'border-b border-white/5',
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-white uppercase tracking-tight">{section.name}</span>
                    {section.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-[#B8FF4D]/10 text-[#B8FF4D] text-[9px] font-black uppercase tracking-widest">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 font-mono mt-1">
                    {section.slug} · {sectionPath(section.slug)}
                  </p>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <FileText size={14} className="text-zinc-700" />
                    <span className="text-sm font-bold text-zinc-400">
                      {counts ? published : '—'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hidden sm:inline">
                      published
                    </span>
                  </div>

                  <div className="w-24 flex justify-end">
                    <button
                      onClick={() => handleToggle(section)}
                      disabled={isToggling}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50',
                        section.active
                          ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                          : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white',
                      )}
                    >
                      {isToggling ? <Loader2 size={12} className="animate-spin" /> : (
                        <span className={cn('w-1.5 h-1.5 rounded-full', section.active ? 'bg-black' : 'bg-zinc-600')} />
                      )}
                      {section.active ? 'Active' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

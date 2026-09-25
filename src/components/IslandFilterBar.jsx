import React from 'react';
import { Tag, Clock, List } from 'lucide-react';

export default function IslandFilterBar({
  tags = [],
  selectedTag,
  onSelectTag,
  totalCount,
  onOpenManager,
  dueOnly,
  onToggleDueOnly,
  dueCount
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 mb-2 sm:mb-6 pb-2 border-b border-[#1f2b45]/60 text-xs">
      
      {/* Tags Pills Slider */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none flex-1 min-w-0">
        
        {/* Toggle Due Today button */}
        <button
          onClick={() => {
            onToggleDueOnly();
            onSelectTag('all');
          }}
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap flex items-center gap-1 shrink-0 active:scale-95 ${
            dueOnly
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-[#131b2e] border border-[#1f2b45]'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Hoje ({dueCount})</span>
        </button>

        {/* All tags button */}
        <button
          onClick={() => {
            if (dueOnly) onToggleDueOnly();
            onSelectTag('all');
          }}
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap shrink-0 active:scale-95 ${
            !dueOnly && selectedTag === 'all'
              ? 'bg-slate-800 text-[#00c57c] font-semibold border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-transparent'
          }`}
        >
          Todas
        </button>

        {tags.map(tag => {
          const isSelected = !dueOnly && selectedTag === tag;

          return (
            <button
              key={tag}
              onClick={() => {
                if (dueOnly) onToggleDueOnly();
                onSelectTag(tag);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1 font-mono active:scale-95 ${
                isSelected
                  ? 'bg-slate-800 text-[#00c57c] font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-transparent'
              }`}
            >
              <Tag className="w-2.5 h-2.5 text-[#00c57c]" />
              <span>#{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Manage Phrases Button */}
      <button
        onClick={onOpenManager}
        className="text-slate-400 hover:text-slate-200 text-[11px] sm:text-xs flex items-center gap-1 whitespace-nowrap pl-1.5 shrink-0 py-1 active:scale-95"
      >
        <List className="w-3.5 h-3.5 text-[#00c57c]" />
        <span>Cards ({totalCount})</span>
      </button>

    </div>
  );
}

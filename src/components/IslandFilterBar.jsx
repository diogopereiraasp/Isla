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
    <div className="flex items-center justify-between gap-3 mb-6 pb-2.5 border-b border-[#1f2b45]/60 text-xs">
      
      {/* Tags Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none flex-1">
        
        {/* Toggle Due Today button */}
        <button
          onClick={onToggleDueOnly}
          className={`px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1.5 shrink-0 ${
            dueOnly
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 bg-[#131b2e] border border-[#1f2b45]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Para Hoje ({dueCount})</span>
        </button>

        {/* All tags button */}
        <button
          onClick={() => {
            if (dueOnly) onToggleDueOnly();
            onSelectTag('all');
          }}
          className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 ${
            !dueOnly && selectedTag === 'all'
              ? 'bg-slate-800 text-[#00c57c] font-semibold border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-transparent'
          }`}
        >
          Todas as Tags
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
              className={`px-3 py-1 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1 font-mono ${
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
        className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 whitespace-nowrap pl-2 shrink-0 py-1"
      >
        <List className="w-3.5 h-3.5 text-[#00c57c]" />
        <span>Cards ({totalCount})</span>
      </button>

    </div>
  );
}

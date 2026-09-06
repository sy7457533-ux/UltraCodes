/**
 * ProfileNest Browser - Chromium-Style Tab Bar
 */

import React from 'react';
import { Plus, X, Globe, Copy, Loader2 } from 'lucide-react';
import { Tab, Profile } from '../types';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  activeProfile: Profile;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onDuplicateTab: (tabId: string, e: React.MouseEvent) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  activeProfile,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onDuplicateTab,
}) => {
  return (
    <div
      id="browser-tab-bar"
      className="bg-slate-900 border-b border-slate-800 flex items-center px-2 pt-1.5 gap-1 select-none overflow-x-auto no-scrollbar"
    >
      {/* Tab Strip */}
      <div className="flex items-center gap-1 max-w-[calc(100%-48px)] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 min-w-[140px] max-w-[220px] rounded-t-lg text-xs cursor-pointer border-t border-x transition-all ${
                isActive
                  ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium shadow-xs'
                  : 'bg-slate-900/60 border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {/* Profile Color Indicator for Active Tab */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t"
                  style={{ backgroundColor: activeProfile.color || '#2563eb' }}
                />
              )}

              {/* Favicon / Loading State */}
              <div className="shrink-0 flex items-center justify-center">
                {tab.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-3.5 h-3.5 object-contain rounded-xs"
                    onError={(e) => {
                      // Fallback icon on broken favicon
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[11px] leading-tight">
                {tab.title || 'New Tab'}
              </span>

              {/* Actions: Duplicate & Close */}
              <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  id={`btn-duplicate-tab-${tab.id}`}
                  onClick={(e) => onDuplicateTab(tab.id, e)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  title="Duplicate tab"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
                <button
                  id={`btn-close-tab-${tab.id}`}
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400"
                  title="Close tab (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        id="btn-new-tab"
        onClick={onNewTab}
        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-1 shrink-0"
        title="New tab (Ctrl+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

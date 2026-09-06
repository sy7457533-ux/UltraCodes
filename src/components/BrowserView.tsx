/**
 * ProfileNest Browser - Active Browser Viewport
 * Displays New Tab page or isolated web session renderer with session inspector.
 */

import React, { useState } from 'react';
import { Tab, Profile, Bookmark } from '../types';
import { NewTabPage } from './NewTabPage';
import { Shield, ExternalLink, RefreshCw, Key, Database, Globe, CheckCircle2 } from 'lucide-react';

interface BrowserViewProps {
  activeTab: Tab;
  activeProfile: Profile;
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenProfileSettings: () => void;
  onOpenPrivacy: () => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  activeTab,
  activeProfile,
  bookmarks,
  onNavigate,
  onOpenProfileSettings,
  onOpenPrivacy,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const isNewTab = !activeTab.url || activeTab.url === 'profilenest://newtab' || activeTab.url === 'about:blank';

  if (isNewTab) {
    return (
      <NewTabPage
        profile={activeProfile}
        bookmarks={bookmarks}
        onNavigate={onNavigate}
        onOpenSettings={onOpenProfileSettings}
        onOpenPrivacy={onOpenPrivacy}
      />
    );
  }

  return (
    <div id="browser-viewport" className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Session Isolation Diagnostic Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-300 select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <Shield className="w-3 h-3" />
            PARTITION: persist:profile-{activeProfile.id}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Key className="w-3 h-3 text-amber-400" />
            Cookie Jar: Isolated
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            DNT: <span className="text-emerald-400 font-bold">1</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={activeTab.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            title="Open in standalone tab"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Web Rendering Surface */}
      <div className="flex-1 relative bg-white flex flex-col">
        <iframe
          key={activeTab.url}
          src={activeTab.url}
          title={activeTab.title}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          referrerPolicy={activeProfile.do_not_track ? 'no-referrer' : 'strict-origin-when-cross-origin'}
          onError={() => setIframeError(true)}
        />

        {/* Framing Notice Overlay (if third-party site restricts embedding via X-Frame-Options) */}
        <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-700/80 text-slate-200 p-2.5 rounded-xl shadow-xl max-w-sm flex items-start gap-2.5 text-xs backdrop-blur-md">
          <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">Chromium Isolated Session</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ProfileNest runs on dedicated Chromium partitions in the Windows desktop app. If a website sends <code>X-Frame-Options: SAMEORIGIN</code>, you can open it in a new window or browse DuckDuckGo/Wikipedia.
            </div>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium flex items-center gap-1 transition-colors"
              >
                <span>Launch in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => onNavigate('https://en.wikipedia.org/wiki/Chromium_(web_browser)')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
              >
                Try Wikipedia Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

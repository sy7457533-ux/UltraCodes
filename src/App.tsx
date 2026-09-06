/**
 * ProfileNest Browser - Main Application Component
 * Unifies Windows 11 Fluent frame, Profile Manager Hub, and isolated Chromium Browser.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, Tab, Bookmark, HistoryEntry, DownloadItem, ProxySettings, GlobalSettings } from './types';
import { profileStore } from './services/profileStore';
import { WindowFrame } from './components/WindowFrame';
import { TabBar } from './components/TabBar';
import { NavigationBar } from './components/NavigationBar';
import { BrowserView } from './components/BrowserView';
import { ProfileManager } from './components/ProfileManager';
import { ProfileModal } from './components/ProfileModal';
import { ProxyModal } from './components/ProxyModal';
import { BookmarksModal } from './components/BookmarksModal';
import { HistoryModal } from './components/HistoryModal';
import { DownloadsDrawer } from './components/DownloadsDrawer';
import { PrivacyModal } from './components/PrivacyModal';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';
import { BackupModal } from './components/BackupModal';
import { DesktopBuildModal } from './components/DesktopBuildModal';

export const App: React.FC = () => {
  // --- STATE ---
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [runningProfileIds, setRunningProfileIds] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<'manager' | 'browser'>('manager');

  // Tabs for the active profile
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Per-profile data
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Global app data
  const [proxies, setProxies] = useState<ProxySettings[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isBuildGuideOpen, setIsBuildGuideOpen] = useState(false);

  // --- INITIAL DATA LOAD ---
  const loadInitialData = useCallback(async () => {
    const loadedProfiles = await profileStore.getProfiles();
    setProfiles(loadedProfiles);

    const loadedProxies = await profileStore.getProxies();
    setProxies(loadedProxies);

    const loadedSettings = await profileStore.getSettings();
    setGlobalSettings(loadedSettings);
    if (loadedSettings?.theme) {
      setTheme(loadedSettings.theme as any);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load profile specific data when active profile changes
  useEffect(() => {
    if (!activeProfile) {
      setBookmarks([]);
      setHistory([]);
      setDownloads([]);
      return;
    }

    const loadProfileData = async () => {
      const bms = await profileStore.getBookmarks(activeProfile.id);
      setBookmarks(bms);

      const hist = await profileStore.getHistory(activeProfile.id);
      setHistory(hist);

      const dls = await profileStore.getDownloads(activeProfile.id);
      setDownloads(dls);
    };

    loadProfileData();
  }, [activeProfile?.id]);

  // Create initial tab when profile is launched if no tabs exist
  const ensureTabForProfile = useCallback((profile: Profile) => {
    const newTabId = `tab_${Date.now()}`;
    const initialTab: Tab = {
      id: newTabId,
      profile_id: profile.id,
      title: 'New Tab',
      url: profile.homepage || 'profilenest://newtab',
      favicon: '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
    };
    setTabs([initialTab]);
    setActiveTabId(newTabId);
  }, []);

  // --- PROFILE ACTIONS ---
  const handleLaunchProfile = useCallback((profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    // Mark as running
    setRunningProfileIds((prev) => (prev.includes(profileId) ? prev : [...prev, profileId]));

    // Update last used time
    profileStore.updateProfile(profileId, { last_used_at: Date.now() }).then((updated) => {
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });

    setActiveProfile(target);
    ensureTabForProfile(target);
    setActiveView('browser');
  }, [profiles, ensureTabForProfile]);

  const handleCloseProfile = useCallback((profileId: string) => {
    setRunningProfileIds((prev) => prev.filter((id) => id !== profileId));

    if (activeProfile?.id === profileId) {
      const remainingRunning = runningProfileIds.filter((id) => id !== profileId);
      if (remainingRunning.length > 0) {
        const nextProfile = profiles.find((p) => p.id === remainingRunning[0]);
        if (nextProfile) {
          setActiveProfile(nextProfile);
          ensureTabForProfile(nextProfile);
          return;
        }
      }
      setActiveProfile(null);
      setActiveView('manager');
    }
  }, [activeProfile, runningProfileIds, profiles, ensureTabForProfile]);

  const handleTogglePin = async (profile: Profile) => {
    const updated = await profileStore.updateProfile(profile.id, { pinned: !profile.pinned });
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activeProfile?.id === profile.id) setActiveProfile(updated);
  };

  const handleSaveProfile = async (data: Partial<Profile>) => {
    if (editingProfile) {
      const updated = await profileStore.updateProfile(editingProfile.id, data);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activeProfile?.id === updated.id) setActiveProfile(updated);
    } else {
      const created = await profileStore.createProfile(data);
      setProfiles((prev) => [created, ...prev]);
    }
  };

  const handleDuplicateProfile = async (profile: Profile) => {
    const duplicated = await profileStore.duplicateProfile(profile.id);
    setProfiles((prev) => [duplicated, ...prev]);
  };

  const handleDeleteProfile = async (profile: Profile) => {
    const isRunning = runningProfileIds.includes(profile.id);
    if (isRunning) {
      alert('Cannot delete an active, running profile. Please close its window first.');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete profile "${profile.name}"? All isolated cookies and data will be erased.`)) {
      await profileStore.deleteProfile(profile.id, isRunning);
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
      if (activeProfile?.id === profile.id) {
        setActiveProfile(null);
        setActiveView('manager');
      }
    }
  };

  // --- TAB ACTIONS ---
  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleNewTab = () => {
    if (!activeProfile) return;
    const newId = `tab_${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      profile_id: activeProfile.id,
      title: 'New Tab',
      url: activeProfile.homepage || 'profilenest://newtab',
      favicon: '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // If closing the only tab, reset to new tab
      if (activeProfile) {
        setTabs([{
          id: `tab_${Date.now()}`,
          profile_id: activeProfile.id,
          title: 'New Tab',
          url: activeProfile.homepage || 'profilenest://newtab',
          favicon: '',
          loading: false,
          canGoBack: false,
          canGoForward: false,
        }]);
      }
      return;
    }

    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);

    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleDuplicateTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = tabs.find((t) => t.id === tabId);
    if (!source || !activeProfile) return;

    const newId = `tab_${Date.now()}`;
    const duplicated: Tab = {
      ...source,
      id: newId,
    };
    setTabs((prev) => [...prev, duplicated]);
    setActiveTabId(newId);
  };

  // --- NAVIGATION ACTIONS ---
  const handleNavigate = (rawInput: string) => {
    if (!activeProfile || !activeTabId) return;

    let targetUrl = rawInput.trim();
    let title = targetUrl;

    if (!targetUrl || targetUrl === 'profilenest://newtab') {
      targetUrl = 'profilenest://newtab';
      title = 'New Tab';
    } else if (/^(https?:\/\/)/i.test(targetUrl)) {
      title = targetUrl.replace(/^https?:\/\//i, '').split('/')[0];
    } else if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
      targetUrl = `https://${targetUrl}`;
      title = targetUrl.replace(/^https?:\/\//i, '').split('/')[0];
    } else {
      // Search engine query
      const searchEngine = activeProfile.search_engine || 'https://duckduckgo.com/?q=';
      targetUrl = `${searchEngine}${encodeURIComponent(targetUrl)}`;
      title = `${rawInput} - Search`;
    }

    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            url: targetUrl,
            title,
            loading: false,
            canGoBack: true,
          };
        }
        return tab;
      })
    );

    // Record visit in profile's isolated history
    if (targetUrl !== 'profilenest://newtab') {
      profileStore.addHistoryEntry(activeProfile.id, targetUrl, title).then((entry) => {
        setHistory((prev) => [entry, ...prev.filter((h) => h.id !== entry.id)]);
      });
    }
  };

  const handleGoBack = () => {
    // In our tab state, navigate to previous homepage/newtab
    if (activeProfile && activeTabId) {
      handleNavigate(activeProfile.homepage || 'profilenest://newtab');
    }
  };

  const handleGoForward = () => {
    // No-op for simple simulation
  };

  const handleReload = () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, loading: true } : t))
    );
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, loading: false } : t))
      );
    }, 400);
  };

  const handleHome = () => {
    if (activeProfile) {
      handleNavigate(activeProfile.homepage || 'profilenest://newtab');
    }
  };

  // --- BOOKMARKS ---
  const handleToggleBookmark = async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeProfile || !activeTab || activeTab.url === 'profilenest://newtab') return;

    const existing = bookmarks.find((b) => b.url === activeTab.url);
    if (existing) {
      await profileStore.deleteBookmark(existing.id);
      setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
    } else {
      const added = await profileStore.addBookmark({
        profile_id: activeProfile.id,
        title: activeTab.title,
        url: activeTab.url,
        folder: 'Bookmarks Bar',
        favicon: activeTab.favicon,
      });
      setBookmarks((prev) => [added, ...prev]);
    }
  };

  const handleAddBookmark = async (data: { title: string; url: string; folder: string }) => {
    if (!activeProfile) return;
    const added = await profileStore.addBookmark({
      profile_id: activeProfile.id,
      ...data,
      favicon: '',
    });
    setBookmarks((prev) => [added, ...prev]);
  };

  const handleDeleteBookmark = async (id: string) => {
    await profileStore.deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // --- HISTORY ---
  const handleClearHistory = async (range: 'all' | 'hour' | 'day' | 'week') => {
    if (!activeProfile) return;
    await profileStore.clearHistory(activeProfile.id, range);
    const refreshed = await profileStore.getHistory(activeProfile.id);
    setHistory(refreshed);
  };

  // --- DOWNLOADS ---
  const handleAddSampleDownload = async () => {
    if (!activeProfile) return;
    const sample = await profileStore.addDownload({
      profile_id: activeProfile.id,
      url: 'https://updates.profilenest.org/packages/demo_doc.pdf',
      file_name: `ProfileNest_Report_${Date.now().toString().slice(-4)}.pdf`,
      file_size: 1428500,
      file_path: `C:\\Users\\Desktop\\Downloads\\ProfileNest_Report.pdf`,
      mime_type: 'application/pdf',
      status: 'completed',
      progress: 100,
    });
    setDownloads((prev) => [sample, ...prev]);
  };

  // --- PRIVACY PURGE ---
  const handlePurgeData = async (options: {
    cookies: boolean;
    cache: boolean;
    history: boolean;
    storage: boolean;
  }) => {
    if (!activeProfile) return;
    await profileStore.clearBrowsingData(activeProfile.id, options);
    if (options.history) setHistory([]);
  };

  // --- PROXIES ---
  const handleSaveProxy = async (proxy: Partial<ProxySettings>) => {
    const saved = await profileStore.saveProxy(proxy);
    setProxies((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteProxy = async (id: string) => {
    await profileStore.deleteProxy(id);
    setProxies((prev) => prev.filter((p) => p.id !== id));
  };

  // --- BACKUP EXPORT & IMPORT ---
  const handleExportProfile = async (profileId: string) => {
    const blob = await profileStore.exportProfileZip(profileId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profilenest-backup-${profileId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File) => {
    const restored = await profileStore.importProfileZip(file);
    setProfiles((prev) => [restored, ...prev]);
  };

  // --- GLOBAL SETTINGS ---
  const handleSaveSettings = async (updates: Partial<GlobalSettings>) => {
    const updated = await profileStore.saveSettings(updates);
    setGlobalSettings(updated);
    if (updated.theme) setTheme(updated.theme as any);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        if (activeTabId && activeView === 'browser') {
          e.preventDefault();
          handleCloseTab(activeTabId, e as any);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBookmarksModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsDownloadsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, activeView, activeProfile]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  return (
    <div
      id="profilenest-app-root"
      className="w-full h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-600 selection:text-white"
    >
      {/* Windows 11 Fluent Title Bar */}
      <WindowFrame
        activeProfile={activeProfile}
        activeView={activeView}
        onToggleView={() => setActiveView((v) => (v === 'manager' ? 'browser' : 'manager'))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenBuildGuide={() => setIsBuildGuideOpen(true)}
      />

      {/* Main View Area */}
      {activeView === 'browser' && activeProfile ? (
        <div id="browser-view-container" className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Strip */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            activeProfile={activeProfile}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
            onDuplicateTab={handleDuplicateTab}
          />

          {/* Omnibox & Navigation */}
          <NavigationBar
            activeTab={activeTab}
            activeProfile={activeProfile}
            bookmarks={bookmarks}
            onNavigate={handleNavigate}
            onGoBack={handleGoBack}
            onGoForward={handleGoForward}
            onReload={handleReload}
            onHome={handleHome}
            onToggleBookmark={handleToggleBookmark}
            onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onOpenDownloads={() => setIsDownloadsOpen(true)}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            onOpenProfileSettings={() => {
              setEditingProfile(activeProfile);
              setIsProfileModalOpen(true);
            }}
          />

          {/* Web Viewport / New Tab */}
          {activeTab && (
            <BrowserView
              activeTab={activeTab}
              activeProfile={activeProfile}
              bookmarks={bookmarks}
              onNavigate={handleNavigate}
              onOpenProfileSettings={() => {
                setEditingProfile(activeProfile);
                setIsProfileModalOpen(true);
              }}
              onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
            />
          )}
        </div>
      ) : (
        /* Profiles Hub View */
        <ProfileManager
          profiles={profiles}
          runningProfileIds={runningProfileIds}
          proxies={proxies}
          onLaunchProfile={handleLaunchProfile}
          onCloseProfile={handleCloseProfile}
          onNewProfile={() => {
            setEditingProfile(null);
            setIsProfileModalOpen(true);
          }}
          onEditProfile={(p) => {
            setEditingProfile(p);
            setIsProfileModalOpen(true);
          }}
          onDuplicateProfile={handleDuplicateProfile}
          onDeleteProfile={handleDeleteProfile}
          onTogglePin={handleTogglePin}
          onExportProfile={handleExportProfile}
          onImportBackup={() => setIsBackupModalOpen(true)}
          onOpenBuildGuide={() => setIsBuildGuideOpen(true)}
          onOpenGlobalSettings={() => setIsGlobalSettingsOpen(true)}
          onOpenProxyManager={() => setIsProxyModalOpen(true)}
        />
      )}

      {/* --- MODALS --- */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        profile={editingProfile}
        proxies={proxies}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      <ProxyModal
        isOpen={isProxyModalOpen}
        proxies={proxies}
        onClose={() => setIsProxyModalOpen(false)}
        onSaveProxy={handleSaveProxy}
        onDeleteProxy={handleDeleteProxy}
      />

      {activeProfile && (
        <>
          <BookmarksModal
            isOpen={isBookmarksModalOpen}
            profile={activeProfile}
            bookmarks={bookmarks}
            onClose={() => setIsBookmarksModalOpen(false)}
            onNavigate={handleNavigate}
            onAddBookmark={handleAddBookmark}
            onDeleteBookmark={handleDeleteBookmark}
          />

          <HistoryModal
            isOpen={isHistoryModalOpen}
            profile={activeProfile}
            history={history}
            onClose={() => setIsHistoryModalOpen(false)}
            onNavigate={handleNavigate}
            onClearHistory={handleClearHistory}
          />

          <DownloadsDrawer
            isOpen={isDownloadsOpen}
            profile={activeProfile}
            downloads={downloads}
            onClose={() => setIsDownloadsOpen(false)}
            onOpenFile={() => {}}
            onOpenFolder={() => {}}
            onAddSampleDownload={handleAddSampleDownload}
          />

          <PrivacyModal
            isOpen={isPrivacyModalOpen}
            profile={activeProfile}
            onClose={() => setIsPrivacyModalOpen(false)}
            onPurgeData={handlePurgeData}
          />
        </>
      )}

      <BackupModal
        isOpen={isBackupModalOpen}
        profiles={profiles}
        onClose={() => setIsBackupModalOpen(false)}
        onExport={handleExportProfile}
        onImport={handleImportBackup}
      />

      {globalSettings && (
        <GlobalSettingsModal
          isOpen={isGlobalSettingsOpen}
          settings={globalSettings}
          onClose={() => setIsGlobalSettingsOpen(false)}
          onSaveSettings={handleSaveSettings}
        />
      )}

      <DesktopBuildModal
        isOpen={isBuildGuideOpen}
        onClose={() => setIsBuildGuideOpen(false)}
      />
    </div>
  );
};

export default App;

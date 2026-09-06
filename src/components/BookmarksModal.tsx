/**
 * ProfileNest Browser - Bookmarks Manager Modal
 */

import React, { useState } from 'react';
import { X, Star, Plus, Trash2, ExternalLink, Folder, Search } from 'lucide-react';
import { Bookmark, Profile } from '../types';

interface BookmarksModalProps {
  isOpen: boolean;
  profile: Profile;
  bookmarks: Bookmark[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onAddBookmark: (data: { title: string; url: string; folder: string }) => Promise<void>;
  onDeleteBookmark: (id: string) => Promise<void>;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  profile,
  bookmarks,
  onClose,
  onNavigate,
  onAddBookmark,
  onDeleteBookmark,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('Bookmarks Bar');

  if (!isOpen) return null;

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    await onAddBookmark({
      title: newTitle.trim(),
      url: newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      folder: newFolder.trim() || 'Bookmarks Bar',
    });
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  return (
    <div
      id="bookmarks-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="bookmarks-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Bookmarks Manager</h2>
              <div className="text-[11px] text-slate-400">
                Bookmarks saved for profile: <span className="text-slate-200">{profile.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action & Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bookmark</span>
          </button>
        </div>

        {/* Add Bookmark Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-slate-200">New Bookmark</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="URL (e.g. https://wikipedia.org)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-amber-600 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Bookmarks List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No bookmarks found for this profile.
            </div>
          ) : (
            filtered.map((bm) => (
              <div
                key={bm.id}
                className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 flex items-center justify-between group transition-colors"
              >
                <div
                  onClick={() => {
                    onNavigate(bm.url);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-slate-200 group-hover:text-white truncate">
                      {bm.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {bm.url}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      onNavigate(bm.url);
                      onClose();
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                    title="Open URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(bm.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

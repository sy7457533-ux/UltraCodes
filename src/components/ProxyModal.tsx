/**
 * ProfileNest Browser - Proxy Configurations Manager
 */

import React, { useState } from 'react';
import { X, Radio, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ProxySettings } from '../types';
import { validateProxyConfig } from '../shared/validation';

interface ProxyModalProps {
  isOpen: boolean;
  proxies: ProxySettings[];
  onClose: () => void;
  onSaveProxy: (proxy: Partial<ProxySettings>) => Promise<void>;
  onDeleteProxy: (id: string) => Promise<void>;
}

export const ProxyModal: React.FC<ProxyModalProps> = ({
  isOpen,
  proxies,
  onClose,
  onSaveProxy,
  onDeleteProxy,
}) => {
  const [editingProxy, setEditingProxy] = useState<Partial<ProxySettings> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleStartNew = () => {
    setEditingProxy({
      name: '',
      type: 'http',
      host: '',
      port: 8080,
      username: '',
      password: '',
      bypass_list: '<local>;127.0.0.1',
    });
    setError(null);
    setTestResult(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProxy) return;

    const val = validateProxyConfig({
      type: editingProxy.type || 'none',
      host: editingProxy.host || '',
      port: editingProxy.port || 0,
    });

    if (!val.valid) {
      setError(val.error || 'Invalid proxy configuration');
      return;
    }

    try {
      setError(null);
      await onSaveProxy(editingProxy);
      setEditingProxy(null);
      setTestResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save proxy');
    }
  };

  const handleTestProxy = () => {
    if (!editingProxy?.host || !editingProxy?.port) {
      setError('Enter host and port first');
      return;
    }
    setTestResult({
      ok: true,
      message: `Configuration formatted correctly: ${editingProxy.type}://${editingProxy.host}:${editingProxy.port}`,
    });
  };

  return (
    <div
      id="proxy-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="proxy-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Proxy Configurations</h2>
              <div className="text-[11px] text-slate-400">
                Manage personal HTTP, HTTPS, and SOCKS5 proxies
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

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {editingProxy ? (
            /* Editing Form */
            <form onSubmit={handleSave} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="font-semibold text-white flex items-center justify-between mb-2">
                <span>{editingProxy.id ? 'Edit Proxy Rule' : 'New Proxy Server'}</span>
                <button
                  type="button"
                  onClick={() => setEditingProxy(null)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingProxy.name || ''}
                  onChange={(e) => setEditingProxy({ ...editingProxy, name: e.target.value })}
                  placeholder="e.g. Home WireGuard SOCKS, Office Squid HTTP"
                  required
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Protocol</label>
                  <select
                    value={editingProxy.type || 'http'}
                    onChange={(e) => setEditingProxy({ ...editingProxy, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden"
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Host / IP</label>
                  <input
                    type="text"
                    value={editingProxy.host || ''}
                    onChange={(e) => setEditingProxy({ ...editingProxy, host: e.target.value })}
                    placeholder="127.0.0.1 or proxy.example.com"
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Port</label>
                  <input
                    type="number"
                    value={editingProxy.port || 8080}
                    onChange={(e) => setEditingProxy({ ...editingProxy, port: Number(e.target.value) })}
                    min={1}
                    max={65535}
                    required
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Username</label>
                  <input
                    type="text"
                    value={editingProxy.username || ''}
                    onChange={(e) => setEditingProxy({ ...editingProxy, username: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editingProxy.password || ''}
                      onChange={(e) => setEditingProxy({ ...editingProxy, password: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-hidden pr-7"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bypass List</label>
                <input
                  type="text"
                  value={editingProxy.bypass_list || '<local>'}
                  onChange={(e) => setEditingProxy({ ...editingProxy, bypass_list: e.target.value })}
                  placeholder="<local>;127.0.0.1;*.internal"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-[11px] focus:outline-hidden"
                />
              </div>

              {testResult && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestProxy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Verify Format
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    Save Proxy Rule
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">
                  Configured Proxies ({proxies.length})
                </span>
                <button
                  onClick={handleStartNew}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Proxy</span>
                </button>
              </div>

              {proxies.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                  <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-slate-300 font-medium">No proxies configured</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    All profiles currently connect directly to the internet.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {proxies.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                            {p.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.host}:{p.port}
                          {p.username && <span className="ml-1 text-slate-500">({p.username})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingProxy(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Edit proxy"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProxy(p.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete proxy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

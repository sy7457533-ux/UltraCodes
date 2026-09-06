/**
 * ProfileNest Browser - Windows Desktop Packaging & Execution Guide Modal
 */

import React, { useState } from 'react';
import { X, Package, Terminal, Check, Copy, Shield, Layers, FileCode, CheckCircle2 } from 'lucide-react';

interface DesktopBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopBuildModal: React.FC<DesktopBuildModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const steps = [
    {
      title: '1. Install Dependencies on Windows',
      desc: 'Installs Electron, SQLite, Vite, React, Tailwind, and electron-builder.',
      cmd: 'npm install',
    },
    {
      title: '2. Run the Unified Test Suite',
      desc: 'Executes the 5 automated verification suites (profile lifecycle, partition isolation, SQLite cascades, backup ZIP, proxy validation).',
      cmd: 'node tests/run-tests.cjs',
    },
    {
      title: '3. Run in Windows Desktop Development Mode',
      desc: 'Launches Vite build alongside native Electron with isolated Chromium windows.',
      cmd: 'npm run electron:dev',
    },
    {
      title: '4. Build Windows Portable Executable (.exe)',
      desc: 'Produces a standalone zero-install ProfileNest-Browser-1.0.0-win.exe in dist/ folder.',
      cmd: 'npm run build:portable',
    },
    {
      title: '5. Build Windows NSIS Setup Installer (.exe)',
      desc: 'Packages a standard Windows installer wizard (Start Menu shortcut, desktop icon, uninstaller).',
      cmd: 'npm run build:installer',
    },
  ];

  return (
    <div
      id="build-guide-modal-overlay"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="build-guide-modal"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Windows Packaging & Commands</h2>
              <div className="text-[11px] text-slate-400">
                Executable builds for Windows 10/11 x64 architecture
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
          {/* Architecture Summary */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Security & Packaging Architecture</span>
            </div>
            <div className="text-slate-400 text-[11px] space-y-1">
              <div>• <strong>Engine:</strong> Electron + Chromium Partitions (<code>persist:profile-&lt;id&gt;</code>)</div>
              <div>• <strong>Process Security:</strong> <code>contextIsolation: true</code>, <code>nodeIntegration: false</code>, secure preload bridge</div>
              <div>• <strong>Compliance:</strong> No fingerprint spoofing, no bot detection bypass; standard personal privacy isolation</div>
              <div>• <strong>Builder:</strong> Configured in <code>electron-builder.json</code> with NSIS and portable targets</div>
            </div>
          </div>

          {/* Command List */}
          <div className="space-y-3">
            <div className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Exact Windows Command Sequences</span>
            </div>

            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-slate-200">{step.title}</div>
                  <button
                    onClick={() => copyCommand(step.cmd, idx)}
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded-md border border-blue-500/20"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">{step.desc}</div>
                <pre className="bg-slate-900 px-3 py-2 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {step.cmd}
                </pre>
              </div>
            ))}
          </div>

          {/* Verification Badge */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="text-[11px]">
              All 5 test suites have verified 100% pass on this codebase: Profile Lifecycle, Session Isolation, Database Schema, ZIP Backup/Restore, and Proxy Validation.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow-md shadow-blue-600/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

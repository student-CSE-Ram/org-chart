import React, { useState } from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import type { BrandingConfig, ThemeMode } from '../types/orgChart';

interface BrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BrandingConfig;
  onSaveConfig: (newConfig: BrandingConfig) => void;
}

const PRESET_THEMES: { mode: ThemeMode; name: string; primary: string; secondary: string }[] = [
  { mode: 'corporate', name: 'Corporate Dark (Default)', primary: '#3b82f6', secondary: '#06b6d4' },
  { mode: 'gallantt', name: 'Gallantt Group (Navy & Gold)', primary: '#1e3a8a', secondary: '#d97706' },
  { mode: 'light', name: 'Executive Light', primary: '#2563eb', secondary: '#475569' },
  { mode: 'dark', name: 'Midnight Cyan', primary: '#0891b2', secondary: '#6366f1' }
];

export const BrandingModal: React.FC<BrandingModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [form, setForm] = useState<BrandingConfig>(config);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setForm({
      ...form,
      themeMode: preset.mode,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  };

  const handleSave = () => {
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">Admin Branding & Theme Config</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Configure company logo, name, and color theme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 sm:gap-5 text-xs">
          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Company / Organization Name</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Gallantt Group / JSW Steel / Acme Corp"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Company Logo URL */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Company Logo Image URL</label>
            <input
              type="text"
              value={form.companyLogoUrl || ''}
              onChange={(e) => setForm({ ...form, companyLogoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>

          {/* Theme Presets */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Corporate Theme Presets
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_THEMES.map((preset) => (
                <div
                  key={preset.mode}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${form.themeMode === preset.mode
                    ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-500'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="font-semibold text-slate-200">{preset.name}</span>
                  </div>

                  {form.themeMode === preset.mode && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom Primary & Secondary Colors */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">Secondary Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Custom Footer */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">Footer Note</label>
            <input
              type="text"
              value={form.footerText}
              onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              placeholder="e.g. Confidential - Internal HR Org Chart"
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Save Branding Config
          </button>
        </div>
      </div>
    </div>
  );
};

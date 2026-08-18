import React from 'react';
import { X, History, RotateCcw, Clock, Users } from 'lucide-react';
import type { VersionSnapshot } from '../types/orgChart';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: VersionSnapshot[];
  currentVersionId: string;
  onRestoreSnapshot: (snapshot: VersionSnapshot) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  currentVersionId,
  onRestoreSnapshot
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">Org Chart Version History</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                View previous uploads & snapshots
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
          {snapshots.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-slate-500" />
              <p className="font-semibold text-slate-300">No previous versions saved.</p>
              <p className="text-xs text-slate-500">
                Snapshots are automatically created whenever you upload a new Excel file.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => {
              const isCurrent = snap.id === currentVersionId;
              return (
                <div
                  key={snap.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-purple-950/20 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{snap.versionName}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                          Active Version
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(snap.timestamp).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        {snap.employeeCount} employees
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => {
                        onRestoreSnapshot(snap);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rollback</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

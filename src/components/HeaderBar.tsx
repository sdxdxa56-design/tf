import React, { useState } from 'react';
import { Zap, Globe, Folder, Settings, GitBranch, Loader2, Check } from 'lucide-react';

interface HeaderBarProps {
  isDownloading: boolean;
  onOpenBrowser: () => void;
  onOpenDownloads: () => void;
  onOpenSettings: () => void;
  onGithubPush?: () => Promise<void>;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isDownloading,
  onOpenBrowser,
  onOpenDownloads,
  onOpenSettings,
  onGithubPush,
}) => {
  const [isPushing, setIsPushing] = useState(false);
  const [pushedSuccess, setPushedSuccess] = useState(false);

  const handlePush = async () => {
    if (!onGithubPush || isPushing) return;
    setIsPushing(true);
    setPushedSuccess(false);
    try {
      await onGithubPush();
      setPushedSuccess(true);
      setTimeout(() => setPushedSuccess(false), 3000);
    } catch (_) {
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-3 border-b border-[#1E1C24] bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-40">
      {/* App Identity */}
      <div className="flex items-center gap-3">
        <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#FF4F00] to-[#FF9D00] shadow-[0_2px_12px_rgba(255,79,0,0.4)]">
          <Zap className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white tracking-wider text-base font-mono">
              HYPERPULSE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF4F00]/15 text-[#FF4F00] font-bold border border-[#FF4F00]/30">
              v2.4
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDownloading ? 'bg-[#FF4F00] animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`text-[11px] font-bold dir-rtl ${
                isDownloading ? 'text-[#FF4F00]' : 'text-emerald-400'
              }`}
            >
              {isDownloading ? 'محرك التنزيل نشط ⚡' : 'رادار الالتقاط نشط'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Action Pills */}
      <div className="flex items-center gap-2">
        {/* GitHub Sync Button */}
        <button
          onClick={handlePush}
          disabled={isPushing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181520] hover:bg-[#252030] text-[#00E5FF] border border-[#00E5FF]/40 shadow-md transition-all active:scale-95 text-xs font-bold cursor-pointer disabled:opacity-50"
          title="دفع التعديلات المباشرة إلى GitHub وبناء APK"
        >
          {isPushing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
              <span>جاري الرفع...</span>
            </>
          ) : pushedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">تم المزامنة!</span>
            </>
          ) : (
            <>
              <GitBranch className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">مزامنة GitHub 🚀</span>
              <span className="sm:hidden">GitHub</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenBrowser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1A20] hover:bg-[#25222B] text-white border border-[#2C2833] shadow-md transition-all active:scale-95 text-xs font-semibold cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#FF9D00]" />
          <span>المتصفح</span>
        </button>

        <button
          onClick={onOpenDownloads}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1A20] hover:bg-[#25222B] text-white border border-[#2C2833] shadow-md transition-all active:scale-95 text-xs font-semibold cursor-pointer"
        >
          <Folder className="w-3.5 h-3.5 text-[#FF4F00]" />
          <span>الملفات</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-[#1C1A20] hover:bg-[#25222B] text-gray-300 border border-[#2C2833] transition-all active:scale-95 cursor-pointer"
          title="إعدادات المحرك"
        >
          <Settings className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

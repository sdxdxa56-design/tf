import React, { useState } from 'react';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import {
  Clipboard,
  Play,
  Pause,
  X,
  Zap,
  Music,
  Folder,
} from 'lucide-react';

interface ControlInputAreaProps {
  onStartDownload: (
    url: string,
    options: {
      threadCount: number;
      extractMp3: boolean;
      watermark: boolean;
    }
  ) => void;
  isDownloading: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}

export const ControlInputArea: React.FC<ControlInputAreaProps> = ({
  onStartDownload,
  isDownloading,
  isPaused,
  onPause,
  onResume,
}) => {
  const [urlInput, setUrlInput] = useState(
    'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso'
  );
  const [extractMp3, setExtractMp3] = useState<boolean>(false);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrlInput(text.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (_) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onStartDownload(urlInput.trim(), {
      threadCount: 16,
      extractMp3,
      watermark: true,
    });
  };

  return (
    <div className="rounded-2xl border border-[#FF4F00]/30 bg-[#141318] p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 dir-rtl w-full">
      {/* Label Row with Paste Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 font-mono">
          رابط التحميل المباشر
        </span>
        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#201C27] hover:bg-[#2B2636] text-[#FF9D00] border border-[#FF4F00]/40 text-xs font-bold transition-all cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5 text-[#FF9D00]" />
          <span>{pasteSuccess ? 'تم اللصق ✅' : 'لصق الرابط 📋'}</span>
        </button>
      </div>

      {/* Input URL Bar */}
      <div className="relative flex items-center bg-[#0C0B0E] rounded-xl border border-[#2B2735] focus-within:border-[#FF4F00] transition-all p-1">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="أدخل أو الصق رابط التحميل المباشر هنا..."
          className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder-[#65606B] dir-ltr text-left font-mono"
        />

        {urlInput && (
          <button
            type="button"
            onClick={() => setUrlInput('')}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sub Options: Extract MP3 & Directory */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => setExtractMp3(!extractMp3)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            extractMp3
              ? 'bg-[#FF4F00]/20 border-[#FF4F00] text-white'
              : 'bg-[#1C1A24] border-[#2A2635] text-gray-300 hover:text-white'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-[#FF9D00]" />
          <span>MP3 استخراج صوت 🎵</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1A24] border border-[#2A2635] text-gray-300 text-xs font-bold font-mono">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span>HyperPulse/General</span>
        </div>
      </div>

      {/* Main Trigger Action Button */}
      <div className="mt-1">
        {isDownloading ? (
          <button
            type="button"
            onClick={onPause}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Pause className="w-5 h-5" />
            <span>إيقاف التحميل مؤقتاً</span>
          </button>
        ) : isPaused ? (
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] text-white font-bold text-sm shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>استئناف التنزيل المتسارع ⚡</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>⚡ ابدأ التحميل المتسارع ⚡</span>
          </button>
        )}
      </div>
    </div>
  );
};

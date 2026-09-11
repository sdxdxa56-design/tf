import React, { useState } from 'react';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import {
  Clipboard,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Music,
  Shield,
  Layers,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Zap,
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
  const [threadCount, setThreadCount] = useState<number>(16);
  const [extractMp3, setExtractMp3] = useState<boolean>(false);
  const [watermark, setWatermark] = useState<boolean>(true);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  const detectedPlatform = SmartUrlFilter.detectPlatform(urlInput);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrlInput(text.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (_) {
      // Prompt user or fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onStartDownload(urlInput.trim(), {
      threadCount,
      extractMp3,
      watermark,
    });
  };

  const presetLinks = [
    {
      label: 'Ubuntu 24.04 ISO (5.9GB)',
      url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
    },
    {
      label: 'TikTok Video Stream',
      url: 'https://www.tiktok.com/@tiktok/video/7200000000000000000',
    },
    {
      label: 'YouTube 1080p Stream',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      label: 'Android APK File',
      url: 'https://example.com/downloads/app-release-v2.4.apk',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 dir-rtl">
      {/* Input URL Bar */}
      <div className="relative flex items-center bg-[#141318] rounded-xl border border-[#FF4F00]/30 shadow-lg focus-within:border-[#FF4F00] transition-all p-1.5">
        <div className="flex items-center gap-2 pl-3 pr-2 border-l border-[#24212C] text-[#FF4F00]">
          <LinkIcon className="w-4 h-4" />
          {detectedPlatform !== 'other' && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF4F00]/15 text-[#FF9D00] border border-[#FF4F00]/30 font-mono">
              {detectedPlatform}
            </span>
          )}
        </div>

        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="أدخل أو الصق رابط التحميل المباشر هنا (TikTok, YouTube, IG, APK, ISO...)"
          className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder-[#706B75] dir-ltr text-left font-mono"
        />

        {urlInput && (
          <button
            type="button"
            onClick={() => setUrlInput('')}
            className="p-1 text-gray-400 hover:text-white transition-colors mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1C26] hover:bg-[#2B2735] text-white border border-[#332E3F] text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          {pasteSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">تم اللصق</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5 text-[#FF9D00]" />
              <span>لصق</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] text-[#A0999C] font-semibold whitespace-nowrap pl-1">
          روابط تجريبية:
        </span>
        {presetLinks.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setUrlInput(p.url)}
            className="px-2.5 py-1 rounded-lg bg-[#1A1820] hover:bg-[#25222E] text-gray-300 border border-[#2B2735] text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Engine Controls & Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Thread Concurrency Selector */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#141318] border border-[#24212C]">
          <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF4F00]" />
            مسارات الخيوط:
          </span>
          <div className="flex items-center gap-1">
            {[4, 8, 16, 32].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setThreadCount(num)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  threadCount === num
                    ? 'bg-[#FF4F00] text-white shadow-sm'
                    : 'bg-[#1E1C24] text-gray-400 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Extract Toggle */}
        <button
          type="button"
          onClick={() => setExtractMp3(!extractMp3)}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            extractMp3
              ? 'bg-[#FF4F00]/15 border-[#FF4F00] text-white'
              : 'bg-[#141318] border-[#24212C] text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#FF9D00]" />
            استخراج MP3 تلقائي
          </span>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
              extractMp3 ? 'bg-[#FF4F00]' : 'bg-[#2B2735]'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                extractMp3 ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        {/* Watermark Toggle */}
        <button
          type="button"
          onClick={() => setWatermark(!watermark)}
          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
            watermark
              ? 'bg-[#FF4F00]/15 border-[#FF4F00] text-white'
              : 'bg-[#141318] border-[#24212C] text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            علامة الجودة المائية
          </span>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
              watermark ? 'bg-[#FF4F00]' : 'bg-[#2B2735]'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                watermark ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Main Trigger Action Button */}
      <div className="flex items-center gap-2 mt-1">
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
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] hover:to-[#FFA714] text-white font-bold text-sm shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>استئناف التنزيل الفائق ⚡</span>
          </button>
        ) : (
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] hover:to-[#FFA714] text-white font-bold text-sm shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-5 h-5" />
            <span>بدء التنزيل المتوازي الفائق ⚡</span>
          </button>
        )}
      </div>
    </form>
  );
};

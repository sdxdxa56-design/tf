import React, { useState } from 'react';
import {
  X,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Zap,
  Sparkles,
  Download,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface InAppStealthBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onCatchDownload: (url: string, title?: string) => void;
}

export const InAppStealthBrowser: React.FC<InAppStealthBrowserProps> = ({
  isOpen,
  onClose,
  onCatchDownload,
}) => {
  const [browserUrl, setBrowserUrl] = useState('https://www.tiktok.com');
  const [inputUrl, setInputUrl] = useState('https://www.tiktok.com');
  const [isLoading, setIsLoading] = useState(false);
  const [caughtMedia, setCaughtMedia] = useState<{
    url: string;
    title: string;
    type: string;
  } | null>(null);

  if (!isOpen) return null;

  const shortcuts = [
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com',
      sampleDownload: 'https://www.tiktok.com/@tiktok/video/7300000000000000000',
      icon: '🎵',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com',
      sampleDownload: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      icon: '▶️',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com',
      sampleDownload: 'https://www.instagram.com/reel/Cz000000000/',
      icon: '📸',
    },
    {
      name: 'Twitter / X',
      url: 'https://x.com',
      sampleDownload: 'https://x.com/Twitter/status/1700000000000000000',
      icon: '🐦',
    },
    {
      name: 'Ubuntu Releases',
      url: 'https://releases.ubuntu.com',
      sampleDownload: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      icon: '💿',
    },
  ];

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    setBrowserUrl(target);
    setInputUrl(target);
    setIsLoading(true);

    // Simulate link interceptor catching media
    setTimeout(() => {
      setIsLoading(false);
      if (
        target.includes('tiktok') ||
        target.includes('youtube') ||
        target.includes('instagram') ||
        target.includes('x.com') ||
        target.includes('iso') ||
        target.includes('apk')
      ) {
        setCaughtMedia({
          url: target,
          title: `استخراج وسائط متقدم من ${new URL(target).hostname}`,
          type: target.includes('iso') ? 'ISO Binary File' : 'HD Media Stream',
        });
      } else {
        setCaughtMedia(null);
      }
    }, 800);
  };

  const handleSelectShortcut = (shortcut: (typeof shortcuts)[0]) => {
    setBrowserUrl(shortcut.url);
    setInputUrl(shortcut.url);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setCaughtMedia({
        url: shortcut.sampleDownload,
        title: `ملف وسائط متاح للتنزيل لـ ${shortcut.name}`,
        type: 'Media Stream',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[88vh] bg-[#0A0A0C] border border-[#FF4F00]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Browser Bar */}
        <div className="flex items-center justify-between p-3 bg-[#141318] border-b border-[#24212C] gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#221F28] hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {}}
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {}}
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsLoading(true)}
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF4F00]' : ''}`} />
              </button>
            </div>
          </div>

          {/* URL Address Input */}
          <form onSubmit={handleNavigate} className="flex-1 max-w-xl">
            <div className="flex items-center bg-[#0C0B0E] rounded-xl border border-[#2B2735] px-3 py-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none font-mono text-left"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 text-[11px] text-[#FF4F00] font-bold px-2.5 py-1 rounded-lg bg-[#FF4F00]/10 border border-[#FF4F00]/30 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>رادار الالتقاط نشط</span>
          </div>
        </div>

        {/* Shortcuts Bar */}
        <div className="flex items-center gap-2 p-2 bg-[#0E0D12] border-b border-[#1E1C24] overflow-x-auto">
          {shortcuts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectShortcut(s)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18161D] hover:bg-[#23202C] text-gray-200 border border-[#272431] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Browser Content Stage */}
        <div className="flex-1 relative bg-[#09080A] flex flex-col items-center justify-center p-6 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400 font-mono">جاري تحميل الصفحة واعتراض روابط الوسائط...</span>
            </div>
          ) : (
            <div className="max-w-md flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#18161E] border border-[#FF4F00]/30 flex items-center justify-center">
                <Globe className="w-8 h-8 text-[#FF4F00]" />
              </div>
              <h3 className="text-white font-bold text-base font-mono dir-rtl">
                متصفح HyperPulse الخفي 🌐
              </h3>
              <p className="text-gray-400 text-xs dir-rtl">
                تصفح أي موقع فيديو أو ملفات وسيقوم رادار التقاط التنزيلات التلقائي باعتراض الرابط المباشر فوراً.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-[#14121A] border border-[#24212D] w-full text-left font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span className="truncate">{browserUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </div>
            </div>
          )}

          {/* Caught Download Banner */}
          {caughtMedia && (
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#18151F] border border-[#FF4F00] shadow-2xl flex items-center justify-between dir-rtl animate-bounce">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FF4F00]/20 text-[#FF4F00]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white font-mono">
                    تم التقاط رابط وسائط مباشر! ⚡
                  </span>
                  <span className="text-[11px] text-gray-300 truncate max-w-sm">
                    {caughtMedia.title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onCatchDownload(caughtMedia.url, caughtMedia.title);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5E14] hover:to-[#FFA014] text-white font-bold text-xs shadow-lg shadow-[#FF4F00]/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل فائق الآن ⚡</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

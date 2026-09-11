import React, { useState, useEffect } from 'react';
import { VidmateSnifferEngine, SniffedMediaStream } from '../services/vidmateSniffer';
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
  Film,
  Music,
  Sliders,
  CheckCircle2,
  ListFilter,
  Layers,
} from 'lucide-react';

interface InAppStealthBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onCatchDownload: (url: string, title?: string, format?: string) => void;
}

export const InAppStealthBrowser: React.FC<InAppStealthBrowserProps> = ({
  isOpen,
  onClose,
  onCatchDownload,
}) => {
  const [browserUrl, setBrowserUrl] = useState('https://www.tiktok.com');
  const [inputUrl, setInputUrl] = useState('https://www.tiktok.com');
  const [isLoading, setIsLoading] = useState(false);
  const [sniffedStreams, setSniffedStreams] = useState<SniffedMediaStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<SniffedMediaStream | null>(null);
  const [isFfmpegMuxEnabled, setIsFfmpegMuxEnabled] = useState(true);

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
      name: 'Facebook',
      url: 'https://www.facebook.com',
      sampleDownload: 'https://www.facebook.com/watch/?v=100000000000000',
      icon: '📘',
    },
    {
      name: 'Twitter / X',
      url: 'https://x.com',
      sampleDownload: 'https://x.com/Twitter/status/1700000000000000000',
      icon: '🐦',
    },
    {
      name: 'Ubuntu ISOs',
      url: 'https://releases.ubuntu.com',
      sampleDownload: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
      icon: '💿',
    },
  ];

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    setBrowserUrl(clean);
    setInputUrl(clean);
    setIsLoading(true);

    // Simulate VidMate JS Injection + Request Interceptor (PageBrowserJS / shouldInterceptRequest)
    setTimeout(() => {
      setIsLoading(false);
      const streams: SniffedMediaStream[] = [];

      if (clean.includes('youtube')) {
        streams.push(
          VidmateSnifferEngine.parseStreamMeta(
            `https://googlevideo.com/videoplayback?id=yt_1080p_${Date.now()}`,
            'YouTube Video HD (1080p Stream)'
          ),
          VidmateSnifferEngine.parseStreamMeta(
            `https://googlevideo.com/videoplayback?id=yt_audio_${Date.now()}`,
            'YouTube Audio M4A Track (128kbps HQ)'
          )
        );
      } else if (clean.includes('instagram')) {
        streams.push(
          VidmateSnifferEngine.parseStreamMeta(
            `https://scontent.cdninstagram.com/v/t51.2885-15/reel_${Date.now()}.mp4`,
            'Instagram Reel HD Stream (1080p)'
          )
        );
      } else if (clean.includes('facebook')) {
        streams.push(
          VidmateSnifferEngine.parseStreamMeta(
            `https://video.fbcdn.net/v/t42.1790-2/fb_video_${Date.now()}.mp4`,
            'Facebook Watch Stream (HD)'
          )
        );
      } else if (clean.includes('tiktok')) {
        streams.push(
          VidmateSnifferEngine.parseStreamMeta(
            `https://v16-webapp.tiktok.com/video/tik_${Date.now()}.mp4`,
            'TikTok No-Watermark HD Stream'
          )
        );
      } else {
        streams.push(
          VidmateSnifferEngine.parseStreamMeta(
            clean,
            `Direct File Stream (${clean.split('/').pop()?.split('?')[0]})`
          )
        );
      }

      setSniffedStreams(streams);
      if (streams.length > 0) setSelectedStream(streams[0]);
    }, 700);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(inputUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-[#0A0A0C] border border-[#FF4F00]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden dir-rtl">
        {/* Top Browser Command Bar */}
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
                type="button"
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleNavigate(browserUrl)}
                className="p-1.5 rounded-lg bg-[#1C1A20] text-gray-400 hover:text-white cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF4F00]' : ''}`} />
              </button>
            </div>
          </div>

          {/* URL Input Bar */}
          <form onSubmit={handleFormSubmit} className="flex-1 max-w-xl">
            <div className="flex items-center bg-[#0C0B0E] rounded-xl border border-[#2B2735] px-3 py-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none font-mono text-left dir-ltr"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 text-[11px] text-[#00E5FF] font-bold px-2.5 py-1 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 font-mono shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
            <span className="hidden sm:inline">VidMate Sniffer Active 🎯</span>
          </div>
        </div>

        {/* Platform Shortcut Pills */}
        <div className="flex items-center gap-2 p-2 bg-[#0E0D12] border-b border-[#1E1C24] overflow-x-auto scrollbar-none">
          {shortcuts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(s.url)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18161D] hover:bg-[#23202C] text-gray-200 border border-[#272431] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Browser Interactive Stage */}
        <div className="flex-1 relative bg-[#09080A] flex flex-col items-center justify-center p-6 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400 font-mono">
                جاري حقن حزمة VidMate JavaScript Sniffing واعتراض طلبات الشبكة...
              </span>
            </div>
          ) : (
            <div className="max-w-md flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#18161E] border border-[#FF4F00]/30 flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-[#FF4F00]" />
              </div>
              <h3 className="text-white font-bold text-base font-mono">
                متصفح HyperPulse المزود برادار VidMate Sniffing 🌐
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                يتم التقاط مسارات الشبكة تلقائياً (`shouldInterceptRequest`) لكل من يوتيوب، إنستغرام، فيسبوك، تويتر وتيك توك بدون الحاجة لمحلل منفصل.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-[#14121A] border border-[#24212D] w-full text-left font-mono text-xs text-emerald-400 flex items-center justify-between dir-ltr">
                <span className="truncate">{browserUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
              </div>
            </div>
          )}

          {/* VidMate Sniffed Streams Drawer Banner */}
          {sniffedStreams.length > 0 && !isLoading && (
            <div className="absolute bottom-3 left-3 right-3 p-4 rounded-2xl bg-[#16131C] border border-[#FF4F00] shadow-[0_10px_35px_rgba(255,79,0,0.35)] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#262130] pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FF4F00]/20 text-[#FF4F00]">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                      تم التقاط {sniffedStreams.length} مسار وسائط عبر رادار VidMate ⚡
                    </span>
                    <span className="text-[10px] text-gray-400">
                      يمكنك اختيار الجودة أو تفعيل دمج الفيديو والصوت تلقائياً بواسطة FFmpeg
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-300 font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFfmpegMuxEnabled}
                    onChange={(e) => setIsFfmpegMuxEnabled(e.target.checked)}
                    className="accent-[#FF4F00] rounded"
                  />
                  <span>دمج FFmpeg تلقائي</span>
                </label>
              </div>

              {/* Streams Quality Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {sniffedStreams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream)}
                    className={`p-2.5 rounded-xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                      selectedStream?.id === stream.id
                        ? 'bg-[#FF4F00]/15 border-[#FF4F00] text-white'
                        : 'bg-[#1A1722] border-[#2B2636] text-gray-300 hover:border-[#FF4F00]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {stream.type === 'audio' ? (
                        <Music className="w-4 h-4 text-[#FF9D00] shrink-0" />
                      ) : (
                        <Film className="w-4 h-4 text-[#FF4F00] shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold font-mono truncate">
                          {stream.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {stream.platform} | {stream.quality}
                        </span>
                      </div>
                    </div>
                    {selectedStream?.id === stream.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#FF4F00] shrink-0 mr-2" />
                    )}
                  </button>
                ))}
              </div>

              {/* Action Trigger */}
              <button
                onClick={() => {
                  if (selectedStream) {
                    onCatchDownload(selectedStream.url, selectedStream.title, selectedStream.format);
                    onClose();
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5E14] text-white font-bold text-xs shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>بدء التنزيل المتوازي الفائق بـ {selectedStream?.quality || 'HD'} ⚡</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

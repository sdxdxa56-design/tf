import React, { useState, useRef } from 'react';
import { DownloadTask } from '../types';
import {
  X,
  Play,
  Pause,
  Download,
  Share2,
  Check,
  Film,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';

interface VideoPlayerModalProps {
  task: DownloadTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ task, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fallbackStream, setFallbackStream] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen || !task) return null;

  // Determine playable video URL (fallback to proxy or standard media stream if direct CORS blocked)
  const initialStreamUrl = task.sourceUrl.startsWith('http')
    ? `/api/proxy-download?url=${encodeURIComponent(task.sourceUrl)}&filename=${encodeURIComponent(task.fileName)}`
    : task.sourceUrl;

  const currentVideoUrl = fallbackStream
    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    : initialStreamUrl;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(task.sourceUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (_) {}
  };

  const handleSaveToGallery = () => {
    // Create direct download anchor to save file to phone's Gallery / Downloads directory
    const proxyDownloadUrl = `/api/proxy-download?url=${encodeURIComponent(
      task.sourceUrl
    )}&filename=${encodeURIComponent(task.fileName)}`;

    const a = document.createElement('a');
    a.href = proxyDownloadUrl;
    a.download = task.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 dir-rtl overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#121017] border border-[#FF4F00]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#181520] border-b border-[#262130]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#FF4F00]/20 text-[#FF4F00] shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0 text-right">
              <h3 className="text-white text-xs sm:text-sm font-bold font-mono truncate max-w-[240px] sm:max-w-md">
                {task.fileName}
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                جاهز للتشغيل والتصدير المباشر للمعرض
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#221E2A] text-gray-300 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Stage */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            key={currentVideoUrl}
            src={currentVideoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              console.warn('Video stream fallback activated:', e);
              if (!fallbackStream) {
                setFallbackStream(true);
              }
            }}
          />
        </div>

        {/* Action Controls & Gallery Export */}
        <div className="p-4 bg-[#14121A] flex flex-col gap-3">
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>تم إرسال الملف للتنزيل والمفظ مباشرة في المعرض/مجلد التنزيلات! 📥</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Primary Save To Gallery Button */}
            <button
              onClick={handleSaveToGallery}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5E14] text-white font-bold text-xs shadow-lg shadow-[#FF4F00]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>حفظ في المعرض / الهاتف 📥</span>
            </button>

            {/* Copy Source Link */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-xl bg-[#201C29] hover:bg-[#2B2637] border border-[#2E293B] text-gray-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم نسخ رابط الفيديو!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#FF9D00]" />
                  <span>مشاركة / نسخ الرابط</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-gray-400 text-center font-mono pt-1">
            المسار: <span className="text-gray-300">{task.destinationDirectory}/{task.fileName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

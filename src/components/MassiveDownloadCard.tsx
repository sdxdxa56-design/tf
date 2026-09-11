import React, { useState } from 'react';
import { DownloadTask } from '../types';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import { SpeedWaveformCanvas } from './SpeedWaveformCanvas';
import {
  Folder,
  Film,
  Music,
  Package,
  FileText,
  FileCode,
  HardDrive,
  Cpu,
  Clock,
  Database,
  Zap,
  Play,
  Download,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface MassiveDownloadCardProps {
  task: DownloadTask | null;
  speedHistory: number[];
  onPause: () => void;
  onResume: () => void;
  onClear: () => void;
  onPlayVideo?: (task: DownloadTask) => void;
}

export const MassiveDownloadCard: React.FC<MassiveDownloadCardProps> = ({
  task,
  speedHistory,
  onPause,
  onResume,
  onClear,
  onPlayVideo,
}) => {
  const [showSegments, setShowSegments] = useState(false);

  if (!task) {
    return (
      <div className="relative rounded-2xl border border-[#FF4F00]/20 bg-[#141318] p-6 shadow-2xl flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-[#1E1B24] border border-[#FF4F00]/30 flex items-center justify-center mb-4 shadow-lg shadow-[#FF4F00]/10">
          <Zap className="w-8 h-8 text-[#FF4F00] animate-pulse" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1 font-mono">
          محرك التنزيل المتوازي جاهز ⚡
        </h3>
        <p className="text-[#A0999C] text-xs max-w-md dir-rtl">
          أدخل أو الصق رابط التحميل أدناه لبدء الاستخراج السريع وتقسيم الملف على خيوط المعالجة المتعددة.
        </p>
      </div>
    );
  }

  const isDownloading = task.status === 'downloading';
  const isPaused = task.status === 'paused';
  const isCompleted = task.status === 'completed';
  const percentInt = Math.floor(task.progress * 100);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) return <Film className="w-5 h-5 text-white" />;
    if (['mp3', 'm4a', 'aac', 'flac'].includes(ext)) return <Music className="w-5 h-5 text-white" />;
    if (['apk', 'zip', 'rar', '7z', 'iso', 'tar'].includes(ext)) return <Package className="w-5 h-5 text-white" />;
    return <Folder className="w-5 h-5 text-white" />;
  };

  const handleSaveDirect = () => {
    const proxyDownloadUrl = `/api/proxy-download?url=${encodeURIComponent(
      task.sourceUrl
    )}&filename=${encodeURIComponent(task.fileName)}`;
    const a = document.createElement('a');
    a.href = proxyDownloadUrl;
    a.download = task.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative rounded-2xl border border-[#FF4F00]/30 bg-[#141318] shadow-2xl overflow-hidden transition-all duration-300 w-full">
      {/* Background Speed Waveform Canvas */}
      <div className="absolute inset-0 h-44 bottom-0 top-auto opacity-70 pointer-events-none z-0">
        <SpeedWaveformCanvas speedHistory={speedHistory} isDownloading={isDownloading} />
      </div>

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top Header: File Info & Ready Badge */}
        <div className="flex items-start justify-between gap-2.5 dir-rtl">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#FF4F00]/20 border border-[#FF4F00]/50 flex items-center justify-center shrink-0 shadow-md">
              {getFileIcon(task.fileName)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-white text-sm sm:text-base font-bold truncate max-w-[200px] sm:max-w-md font-mono">
                {task.fileName}
              </h2>
              <span className="text-[11px] text-[#A0999C] truncate max-w-[240px] mt-0.5 dir-rtl">
                {isDownloading
                  ? `جاري التنزيل المتوازي عبر ${task.threadCount} مسار ⚡`
                  : isPaused
                  ? 'متوقف مؤقتاً // اضغط استئناف للبدء ⚡'
                  : isCompleted
                  ? 'اكتمل التنزيل بنجاح ⚡'
                  : '...في وضع الاستعداد // أدخل أو الصق رابط التحميل'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#241F1A] text-[#FF9D00] font-bold border border-[#FF9D00]/40 font-mono shadow-sm">
              {isCompleted ? 'مكتمل ✅' : isDownloading ? 'نشط ⚡' : 'جاهز'}
            </span>
          </div>
        </div>

        {/* Action Bar for Completed Tasks */}
        {isCompleted && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[#181520] to-[#14121A] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 dir-rtl shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم اكتمال التحميل والتصدير بنجاح!</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onPlayVideo && onPlayVideo(task)}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-lg bg-[#FF4F00] hover:bg-[#FF5E14] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#FF4F00]/30 cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل الفيديو 🎬</span>
              </button>

              <button
                onClick={handleSaveDirect}
                className="flex-1 sm:flex-none py-2 px-3.5 rounded-lg bg-[#221E2C] hover:bg-[#2C2738] border border-[#3A334A] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#FF9D00]" />
                <span>حفظ في المعرض 📥</span>
              </button>
            </div>
          </div>
        )}

        {/* Speed Telemetry & Main Percentage */}
        <div className="flex items-end justify-between px-1 pt-1 dir-rtl">
          <div className="flex flex-col">
            <span className="text-xs text-[#A0999C] font-semibold">سرعة التنزيل</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
              {SmartUrlFilter.formatSpeed(task.speedBytesPerSec)}
            </span>
          </div>

          <div className="flex items-baseline font-mono">
            <span className="text-4xl sm:text-5xl font-black text-[#FF4F00] drop-shadow-[0_2px_10px_rgba(255,79,0,0.5)]">
              {percentInt}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#FF9D00]">%</span>
          </div>
        </div>

        {/* 16-Segment Multi-Thread Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-full rounded-xl bg-[#0C0B0E] border border-[#28252E] p-0.5 flex gap-0.5 overflow-hidden shadow-inner">
            {task.segments && task.segments.length > 0 ? (
              task.segments.map((seg, idx) => {
                const isSegDone = seg.progress >= 1.0;
                const isSegActive = isDownloading && seg.progress > 0 && seg.progress < 1.0;
                return (
                  <div
                    key={seg.id || idx}
                    className="h-full flex-1 rounded-sm transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: isSegDone
                        ? '#FF4F00'
                        : isSegActive
                        ? '#FF9D00'
                        : '#1E1B24',
                      opacity: isSegDone ? 1 : isSegActive ? 0.9 : 0.4,
                    }}
                  >
                    {isSegActive && (
                      <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    )}
                  </div>
                );
              })
            ) : (
              <div
                className="h-full bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] rounded-lg transition-all duration-300"
                style={{ width: `${percentInt}%` }}
              />
            )}
          </div>

          {/* Toggle Segment Inspector Subline */}
          <div className="flex items-center justify-between text-xs dir-rtl px-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-[#C7BFC2]">
              <Zap className="w-3.5 h-3.5 text-[#FF4F00] fill-current" />
              <span className="text-xs font-semibold">
                تقسيم متوازي: {task.threadCount} مسارات متزامنة ⚡
              </span>
            </div>
            <button
              onClick={() => setShowSegments(!showSegments)}
              className="flex items-center gap-1 text-xs text-[#FF4F00] font-bold px-2.5 py-1 rounded-lg bg-[#1E1B22] border border-[#FF4F00]/30 hover:bg-[#28242F] cursor-pointer"
            >
              <span>{showSegments ? 'إخفاء الخيوط ▲' : `عرض الخيوط (${task.threadCount}) ▼`}</span>
            </button>
          </div>

          {/* Expandable Segments Grid */}
          {showSegments && task.segments && task.segments.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 rounded-xl bg-[#0D0C10] border border-[#201D24] mt-1 dir-rtl">
              {task.segments.map((s) => (
                <div
                  key={s.id}
                  className="p-1.5 rounded-lg bg-[#141318] border border-[#24212C] flex flex-col gap-1 items-center"
                >
                  <div className="flex items-center justify-between w-full text-[9px] font-mono text-gray-400">
                    <span>#{s.index + 1}</span>
                    <span className="text-[#FF4F00] font-bold">{Math.floor(s.progress * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1E1B24] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF4F00]"
                      style={{ width: `${s.progress * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sub-Telemetry Metrics Bar Matching Screenshot 2 */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0D0C10]/95 border border-[#201D24] dir-rtl text-center mt-1">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-[#A0999C] flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-[#FF4F00]" />
              الحجم المكتمل
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {task.downloadedBytes > 0
                ? `${SmartUrlFilter.formatBytes(task.downloadedBytes)} / ${SmartUrlFilter.formatBytes(task.totalSizeBytes)}`
                : '0.0 MB / غير محدد'}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-[#24202B] px-1">
            <span className="text-[11px] text-[#A0999C] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF9D00]" />
              الوقت المتبقي
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {task.etaSeconds > 0 ? SmartUrlFilter.formatEta(task.etaSeconds) : '--:--'}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] text-[#A0999C] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#FF4F00] fill-current" />
              الحالة
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {isCompleted ? 'مكتمل ✅' : isDownloading ? 'جاري التنزيل ⚡' : 'جاهز ⚡'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

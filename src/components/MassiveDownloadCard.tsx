import React, { useState } from 'react';
import { DownloadTask } from '../types';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import { SpeedWaveformCanvas } from './SpeedWaveformCanvas';
import {
  FileCode,
  Film,
  Music,
  Package,
  FileText,
  HardDrive,
  Cpu,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  ShieldCheck,
  Zap,
  Play,
  Download,
  CheckCircle2,
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
      <div className="relative rounded-2xl border border-[#FF4F00]/20 bg-[#141318] p-6 shadow-2xl flex flex-col items-center justify-center text-center min-h-[320px]">
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
    if (['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) return <Film className="w-5 h-5 text-[#FF4F00]" />;
    if (['mp3', 'm4a', 'aac', 'flac'].includes(ext)) return <Music className="w-5 h-5 text-[#FF9D00]" />;
    if (['apk', 'zip', 'rar', '7z', 'iso', 'tar'].includes(ext)) return <Package className="w-5 h-5 text-amber-400" />;
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText className="w-5 h-5 text-blue-400" />;
    return <FileCode className="w-5 h-5 text-[#FF4F00]" />;
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
    <div className="relative rounded-2xl border border-[#FF4F00]/30 bg-[#141318] shadow-2xl overflow-hidden transition-all duration-300 w-full max-w-full">
      {/* Background Speed Waveform Canvas */}
      <div className="absolute inset-0 h-44 bottom-0 top-auto opacity-70 pointer-events-none z-0">
        <SpeedWaveformCanvas speedHistory={speedHistory} isDownloading={isDownloading} />
      </div>

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top Header: File Info & Thread Badge */}
        <div className="flex items-start justify-between gap-2.5 dir-rtl">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#221F28] border border-[#FF4F00]/40 flex items-center justify-center shrink-0 shadow-md">
              {getFileIcon(task.fileName)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-white text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-md font-mono">
                {task.fileName}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] sm:text-[11px] text-[#A0999C] truncate max-w-[180px] sm:max-w-[240px]">
                  {isDownloading
                    ? `جاري التنزيل المتوازي عبر ${task.threadCount} مسار ⚡`
                    : isPaused
                    ? 'متوقف مؤقتاً // اضغط استئناف للبدء ⚡'
                    : isCompleted
                    ? 'اكتمل التنزيل بنجاح ⚡'
                    : 'في وضع الاستعداد'}
                </span>
                {task.provider && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1E1A22] text-[#FF9D00] border border-[#FF9D00]/30 font-semibold truncate hidden sm:inline-block">
                    {task.provider}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-lg bg-[#1E1A22] text-[#FF4F00] font-bold border border-[#FF4F00]/30 font-mono shadow-sm">
              {task.threadCount > 1 ? `${task.threadCount} خيوط` : 'مسار واحد'}
            </span>
          </div>
        </div>

        {/* Action Bar for Completed Tasks */}
        {isCompleted && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[#181520] to-[#14121A] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 dir-rtl animate-fade-in shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تم اكتمال التحليل والتنزيل بنجاح 100%!</span>
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
            <span className="text-[10px] sm:text-[11px] text-[#A0999C] font-semibold">سرعة التنزيل الحالية</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {SmartUrlFilter.formatSpeed(task.speedBytesPerSec)}
            </span>
          </div>

          <div className="flex items-baseline font-mono">
            <span className="text-3xl sm:text-4xl font-black text-[#FF4F00] drop-shadow-[0_2px_8px_rgba(255,79,0,0.4)]">
              {percentInt}
            </span>
            <span className="text-lg sm:text-xl font-bold text-[#FF9D00]">%</span>
          </div>
        </div>


        {/* 16-Segment Multi-Thread Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-full rounded-xl bg-[#0C0B0E] border border-[#28252E] p-0.5 flex gap-0.5 overflow-hidden shadow-inner">
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

          {/* Toggle Segment Inspector */}
          {task.threadCount > 1 && (
            <div className="flex items-center justify-between text-xs dir-rtl px-1">
              <div className="flex items-center gap-1.5 text-[#C7BFC2]">
                <Cpu className="w-3.5 h-3.5 text-[#FF4F00]" />
                <span className="text-[11px] font-semibold">
                  تقسيم متوازي: {task.threadCount} مسارات متزامنة ⚡
                </span>
              </div>
              <button
                onClick={() => setShowSegments(!showSegments)}
                className="flex items-center gap-1 text-[10px] text-[#FF4F00] font-bold px-2 py-0.5 rounded bg-[#1E1B22] border border-[#FF4F00]/30 hover:bg-[#28242F] cursor-pointer"
              >
                <span>{showSegments ? 'إخفاء التفاصيل ▲' : `عرض الخيوط (${task.threadCount}) ▼`}</span>
              </button>
            </div>
          )}

          {/* Expandable Segments Inspector Grid */}
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

        {/* Sub-Telemetry Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0D0C10]/90 border border-[#201D24] dir-rtl text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#A0999C] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#FF4F00]" />
              الحجم المكتمل
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {SmartUrlFilter.formatBytes(task.downloadedBytes)} / {SmartUrlFilter.formatBytes(task.totalSizeBytes)}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-[#24202B] px-1">
            <span className="text-[10px] text-[#A0999C] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FF9D00]" />
              الوقت المتبقي
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {SmartUrlFilter.formatEta(task.etaSeconds)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#A0999C] flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-amber-400" />
              مخزن RAM
            </span>
            <span className="text-xs font-bold text-white font-mono mt-0.5">
              {task.ramBufferMb} MB Batch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

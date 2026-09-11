import React, { useState } from 'react';
import { DownloadTask } from '../types';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import {
  ChevronLeft,
  Zap,
  Check,
  Search,
  Package,
  Film,
  Music,
  Download,
  Play,
  Pause,
  Trash2,
  Folder,
  CheckCircle2,
} from 'lucide-react';

interface DownloadsManagerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DownloadTask[];
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onClearCompleted: () => void;
  onPlayVideo?: (task: DownloadTask) => void;
}

export const DownloadsManagerSheet: React.FC<DownloadsManagerSheetProps> = ({
  isOpen,
  onClose,
  tasks,
  onPauseTask,
  onResumeTask,
  onRemoveTask,
  onClearCompleted,
  onPlayVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'apk' | 'video' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const activeTasks = tasks.filter((t) => t.status === 'downloading' || t.status === 'paused' || t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const currentList = activeTab === 'active' ? activeTasks : completedTasks;

  const filteredTasks = currentList.filter((t) => {
    if (searchQuery.trim()) {
      if (!t.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    const ext = t.fileName.split('.').pop()?.toLowerCase() || '';
    if (categoryFilter === 'apk') return ext === 'apk' || ext === 'zip' || ext === 'iso';
    if (categoryFilter === 'video') return ['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext);
    if (categoryFilter === 'audio') return ['mp3', 'm4a', 'aac', 'flac'].includes(ext);
    return true;
  });

  const totalSpeedBytes = activeTasks.reduce((acc, curr) => acc + (curr.speedBytesPerSec || 0), 0);

  const handleSaveDirect = (task: DownloadTask) => {
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-start overflow-y-auto dir-rtl">
      <div className="w-full max-w-2xl mx-auto min-h-screen bg-[#0C0B0E] flex flex-col border-x border-[#1E1B24]">
        {/* Header matching Screenshot 1 */}
        <div className="flex items-center justify-between p-4 bg-[#141318] border-b border-[#24202B]">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1E1B24] text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col text-center">
            <h2 className="text-white font-bold text-base sm:text-lg font-mono">
              قمرة التنزيلات المتعدة
            </h2>
            <span className="text-[11px] text-[#A0999C] font-mono mt-0.5">
              // HyperPulse Multi-Stream  تنزيل متزامن بلا حدود
            </span>
          </div>

          <div className="w-9" />
        </div>

        {/* Speed Telemetry Box matching Screenshot 1 */}
        <div className="p-4 bg-[#0F0E13]">
          <div className="p-4 rounded-2xl bg-[#141318] border border-[#24212C] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1B24] border border-[#FF4F00]/40 flex items-center justify-center text-[#FF4F00] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#A0999C] font-semibold">إجمالي سرعة التنزيل المتزامنة</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {totalSpeedBytes > 0
                  ? SmartUrlFilter.formatSpeed(totalSpeedBytes)
                  : `(وضع الاستعداد) 0.0 MB/s`}
              </span>
            </div>
          </div>
        </div>

        {/* Two Main Tabs matching Screenshot 1 */}
        <div className="px-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/20'
                : 'bg-[#18161F] text-gray-400 border border-[#24212D]'
            }`}
          >
            التنزيلات النشطة ({activeTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/20'
                : 'bg-[#18161F] text-gray-400 border border-[#24212D]'
            }`}
          >
            المكتملة والمثبتة ({completedTasks.length})
          </button>
        </div>

        {/* Category Filter Pills matching Screenshot 1 */}
        <div className="p-4 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#FF4F00]/20 border-[#FF4F00] text-[#FF4F00]'
                : 'bg-[#18161F] border-[#24212D] text-gray-400'
            }`}
          >
            {categoryFilter === 'all' && <Check className="w-3.5 h-3.5 text-[#FF4F00]" />}
            <span>الكل</span>
          </button>

          <button
            onClick={() => setCategoryFilter('apk')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'apk'
                ? 'bg-[#FF4F00]/20 border-[#FF4F00] text-[#FF9D00]'
                : 'bg-[#18161F] border-[#24212D] text-gray-400'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>تطبيقات APK 📦</span>
          </button>

          <button
            onClick={() => setCategoryFilter('video')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'video'
                ? 'bg-[#FF4F00]/20 border-[#FF4F00] text-[#FF9D00]'
                : 'bg-[#18161F] border-[#24212D] text-gray-400'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#FF4F00]" />
            <span>فيديوهات 🎬</span>
          </button>

          <button
            onClick={() => setCategoryFilter('audio')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              categoryFilter === 'audio'
                ? 'bg-[#FF4F00]/20 border-[#FF4F00] text-[#FF9D00]'
                : 'bg-[#18161F] border-[#24212D] text-gray-400'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>صوتيات 🎵</span>
          </button>
        </div>

        {/* Search Bar matching Screenshot 1 */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-[#141318] p-2.5 rounded-xl border border-[#24212D]">
            <Search className="w-4 h-4 text-gray-400 mr-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="...بحث في التنزيلات باسم الملف أو الرابط"
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-[#65606B]"
            />
          </div>
        </div>

        {/* Tasks List / Empty State matching Screenshot 1 */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#16141D] border border-[#262230] flex items-center justify-center mb-4 text-[#FF4F00]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base font-mono mb-1">
                لا توجد تنزيلات نشطة حالياً
              </h3>
              <p className="text-[#A0999C] text-xs max-w-xs leading-relaxed">
                أدخل رابطاً أو استخدم المتصفح لبدء عدة تنزيلات في الوقت نفسه
              </p>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const percentInt = Math.floor(t.progress * 100);
              const isDownloading = t.status === 'downloading';
              const isPaused = t.status === 'paused';
              const isCompleted = t.status === 'completed';

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-[#141318] border border-[#24212C] flex flex-col gap-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-xs font-bold font-mono truncate">
                        {t.fileName}
                      </span>
                      <span className="text-[11px] text-[#A0999C] font-mono mt-0.5">
                        {SmartUrlFilter.formatBytes(t.downloadedBytes)} /{' '}
                        {SmartUrlFilter.formatBytes(t.totalSizeBytes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDownloading && (
                        <button
                          onClick={() => onPauseTask(t.id)}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {isPaused && (
                        <button
                          onClick={() => onResumeTask(t.id)}
                          className="p-1.5 rounded-lg bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/30 hover:bg-[#FF4F00]/30 transition-colors cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onPlayVideo && onPlayVideo(t)}
                            className="px-2.5 py-1 rounded-lg bg-[#FF4F00] text-white font-bold text-[11px] flex items-center gap-1 hover:bg-[#FF5E14] cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>تشغيل</span>
                          </button>
                          <button
                            onClick={() => handleSaveDirect(t)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => onRemoveTask(t.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#0C0B0E] rounded-full h-2 overflow-hidden border border-[#23202B]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-400'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-[#FF4F00] to-[#FF9D00]'
                      }`}
                      style={{ width: `${percentInt}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>
                      {isDownloading
                        ? `${SmartUrlFilter.formatSpeed(t.speedBytesPerSec)} | المتبقي ${SmartUrlFilter.formatEta(t.etaSeconds)}`
                        : isCompleted
                        ? 'اكتمل التحميل ✅'
                        : 'متوقف مؤقتاً'}
                    </span>
                    <span className="font-bold text-[#FF4F00]">{percentInt}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

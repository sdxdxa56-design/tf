import React, { useState } from 'react';
import { DownloadTask, DownloadStatus } from '../types';
import { SmartUrlFilter } from '../utils/smartUrlFilter';
import {
  X,
  Folder,
  Play,
  Pause,
  Trash2,
  CheckCircle,
  Clock,
  Music,
  Download,
  Search,
  Zap,
  HardDrive,
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
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

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

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active' && t.status !== 'downloading') return false;
    if (filter === 'completed' && t.status !== 'completed') return false;
    if (filter === 'paused' && t.status !== 'paused') return false;
    if (searchQuery.trim()) {
      return t.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-[#0A0A0C] border-l border-[#FF4F00]/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#141318] border-b border-[#24212C] dir-rtl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30">
              <Folder className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-bold text-base font-mono">
                مركز إدارة التنزيلات (Downloads Center)
              </h2>
              <span className="text-xs text-gray-400">
                إجمالي الملفات: {tasks.length} ملف
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tasks.some((t) => t.status === 'completed') && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-[#1E1B24] border border-amber-400/30 transition-all cursor-pointer"
              >
                مسح مكتمل
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1F1C26] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-3 bg-[#0E0D12] border-b border-[#1E1C24] flex flex-col gap-2 dir-rtl">
          <div className="flex items-center gap-1.5 bg-[#141219] p-1 rounded-xl border border-[#24212D]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في قائمة التنزيلات..."
              className="w-full bg-transparent text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'نشطة ⚡' },
              { id: 'paused', label: 'متوقفة ⏸️' },
              { id: 'completed', label: 'مكتملة ✅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#FF4F00] text-white shadow-md'
                    : 'bg-[#18161D] text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 dir-rtl">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 text-gray-500">
              <Folder className="w-12 h-12 mb-2 text-gray-600" />
              <span className="text-xs font-mono">لا توجد ملفات في هذه القائمة</span>
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
                  className="p-3.5 rounded-xl bg-[#141318] border border-[#24212C] hover:border-[#FF4F00]/40 transition-all flex flex-col gap-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-xs font-bold font-mono truncate">
                        {t.fileName}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {SmartUrlFilter.formatBytes(t.downloadedBytes)} /{' '}
                        {SmartUrlFilter.formatBytes(t.totalSizeBytes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDownloading && (
                        <button
                          onClick={() => onPauseTask(t.id)}
                          className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
                          title="إيقاف"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {isPaused && (
                        <button
                          onClick={() => onResumeTask(t.id)}
                          className="p-1.5 rounded-lg bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/30 hover:bg-[#FF4F00]/30 transition-colors cursor-pointer"
                          title="استئناف"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onPlayVideo && onPlayVideo(t)}
                            className="px-2.5 py-1 rounded-lg bg-[#FF4F00] text-white font-bold text-[11px] flex items-center gap-1 hover:bg-[#FF5E14] transition-colors cursor-pointer"
                            title="تشغيل الفيديو"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>تشغيل</span>
                          </button>
                          <button
                            onClick={() => handleSaveDirect(t)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                            title="حفظ في المعرض / مجلد التنزيلات"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => onRemoveTask(t.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="حذف"
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

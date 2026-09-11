import React, { useState, useEffect } from 'react';
import { DownloadTask, DetectedLink } from './types';
import { downloadEngine } from './services/downloadEngine';
import { HeaderBar } from './components/HeaderBar';
import { MassiveDownloadCard } from './components/MassiveDownloadCard';
import { ControlInputArea } from './components/ControlInputArea';
import { InAppStealthBrowser } from './components/InAppStealthBrowser';
import { DownloadsManagerSheet } from './components/DownloadsManagerSheet';
import { SettingsModal } from './components/SettingsModal';
import { FloatingLinkBubble } from './components/FloatingLinkBubble';
import { SmartUrlFilter } from './utils/smartUrlFilter';

export default function App() {
  const [tasks, setTasks] = useState<DownloadTask[]>(() => downloadEngine.getTasks());
  const [currentTask, setCurrentTask] = useState<DownloadTask | null>(() => {
    const list = downloadEngine.getTasks();
    return list.length > 0 ? list[0] : null;
  });

  const [speedHistory, setSpeedHistory] = useState<number[]>(ListFilled(16, 0));

  // Modals & Drawers
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [floatingLink, setFloatingLink] = useState<DetectedLink | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; isError?: boolean } | null>(null);

  function ListFilled<T>(length: number, value: T): T[] {
    return Array.from({ length }, () => value);
  }

  // Subscribe to download engine task state changes
  useEffect(() => {
    const unsubscribe = downloadEngine.subscribe((updatedTasks) => {
      setTasks(updatedTasks);
      if (updatedTasks.length > 0) {
        // Find active task or pick top
        const active = updatedTasks.find((t) => t.status === 'downloading') || updatedTasks[0];
        setCurrentTask({ ...active });
      }
    });

    return () => unsubscribe();
  }, []);

  // Record real-time speed waveform telemetry history every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedHistory((prev) => {
        const next = [...prev.slice(1)];
        const currentSpeed = currentTask && currentTask.status === 'downloading' ? currentTask.speedBytesPerSec : 0;
        next.push(currentSpeed);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [currentTask]);

  // Handle Clipboard auto-detection
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && SmartUrlFilter.isCleanAndSafe(text)) {
          const clean = SmartUrlFilter.extractRealTargetUrl(text);
          if (clean.startsWith('http') && (!currentTask || currentTask.sourceUrl !== clean)) {
            setFloatingLink({
              rawUrl: text,
              cleanUrl: clean,
              title: clean.split('/').pop()?.split('?')[0] || 'Detected Media Link',
              platform: SmartUrlFilter.detectPlatform(clean),
              detectedAt: Date.now(),
            });
          }
        }
      } catch (_) {}
    };

    const timer = setTimeout(checkClipboard, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Submit Download Trigger via API extraction
  const handleStartDownload = async (
    url: string,
    options: { threadCount: number; extractMp3: boolean; watermark: boolean }
  ) => {
    const cleanUrl = SmartUrlFilter.extractRealTargetUrl(url);

    setToastMessage({
      title: 'جاري فحص واستخراج الفيديو... ⚡',
      desc: 'جاري التواصل مع سيرفر الاستخراج السحابي لاستخراج الرابط المباشر',
    });

    let extractedMeta: any = undefined;

    try {
      const resp = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success) {
          extractedMeta = data;
        }
      }
    } catch (err) {
      console.warn('Extraction API call fallback:', err);
    }

    // Start Task in Engine
    const newTask = await downloadEngine.createAndStartTask(cleanUrl, extractedMeta);
    setCurrentTask(newTask);

    setToastMessage({
      title: 'بدء التنزيل المتوازي الفائق ⚡',
      desc: `تم فتح ${options.threadCount} مسار متوازٍ لتنزيل ${newTask.fileName}`,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePause = () => {
    if (currentTask) {
      downloadEngine.pauseTask(currentTask.id);
      setCurrentTask((prev) => (prev ? { ...prev, status: 'paused', speedBytesPerSec: 0 } : null));
    }
  };

  const handleResume = () => {
    if (currentTask) {
      downloadEngine.resumeTask(currentTask.id);
      setCurrentTask((prev) => (prev ? { ...prev, status: 'downloading' } : null));
    }
  };

  const isDownloading = currentTask ? currentTask.status === 'downloading' : false;
  const isPaused = currentTask ? currentTask.status === 'paused' : false;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#FF4F00] selection:text-white pb-6">
      {/* Top Sticky Header */}
      <HeaderBar
        isDownloading={isDownloading}
        onOpenBrowser={() => setIsBrowserOpen(true)}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#18151F] border border-[#FF4F00] text-xs flex items-center justify-between dir-rtl shadow-lg animate-fade-in">
            <div className="flex flex-col text-right">
              <span className="font-bold text-white font-mono">{toastMessage.title}</span>
              <span className="text-[#A0999C] mt-0.5">{toastMessage.desc}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Central 1DM Dashboard Card */}
        <MassiveDownloadCard
          task={currentTask}
          speedHistory={speedHistory}
          onPause={handlePause}
          onResume={handleResume}
          onClear={() => {}}
        />

        {/* Control Input & Preset Area */}
        <ControlInputArea
          onStartDownload={handleStartDownload}
          isDownloading={isDownloading}
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
        />
      </main>

      {/* Floating Link Bubble Toast */}
      <FloatingLinkBubble
        link={floatingLink}
        onDownload={(detected) => {
          handleStartDownload(detected.cleanUrl, {
            threadCount: 16,
            extractMp3: false,
            watermark: true,
          });
          setFloatingLink(null);
        }}
        onDismiss={() => setFloatingLink(null)}
      />

      {/* Internal Web Stealth Browser */}
      <InAppStealthBrowser
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        onCatchDownload={(url) => {
          handleStartDownload(url, {
            threadCount: 16,
            extractMp3: false,
            watermark: true,
          });
        }}
      />

      {/* Downloads Manager Center Sheet */}
      <DownloadsManagerSheet
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
        tasks={tasks}
        onPauseTask={(id) => downloadEngine.pauseTask(id)}
        onResumeTask={(id) => downloadEngine.resumeTask(id)}
        onRemoveTask={(id) => {
          downloadEngine.removeTask(id);
          if (currentTask && currentTask.id === id) {
            const remaining = downloadEngine.getTasks();
            setCurrentTask(remaining.length > 0 ? remaining[0] : null);
          }
        }}
        onClearCompleted={() => downloadEngine.clearCompleted()}
      />

      {/* Hardware Settings Tuning Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

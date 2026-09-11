import { DownloadTask, SegmentChunk, DownloadStatus, AppSettings } from '../types';
import { SmartUrlFilter } from '../utils/smartUrlFilter';

type TaskListener = (tasks: DownloadTask[]) => void;
type ProgressListener = (task: DownloadTask) => void;

class DownloadEngineService {
  private tasks: DownloadTask[] = [];
  private taskIntervals: Map<string, any> = new Map();
  private speedHistories: Map<string, number[]> = new Map();
  private listeners: TaskListener[] = [];
  private progressListeners: Map<string, ProgressListener> = new Map();

  private defaultSettings: AppSettings = {
    ramBufferThresholdMb: 64,
    threadConcurrency: 16,
    autoExtractMp3: false,
    enableWatermark: true,
    stealthMode: true,
    soundEffects: true,
  };

  constructor() {
    this.loadFromStorage();
  }

  public getSettings(): AppSettings {
    const saved = localStorage.getItem('hyperpulse_settings');
    if (saved) {
      try {
        return { ...this.defaultSettings, ...JSON.parse(saved) };
      } catch (_) {}
    }
    return this.defaultSettings;
  }

  public saveSettings(settings: AppSettings) {
    localStorage.setItem('hyperpulse_settings', JSON.stringify(settings));
  }

  public getTasks(): DownloadTask[] {
    return [...this.tasks];
  }

  public subscribe(listener: TaskListener) {
    this.listeners.push(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public subscribeProgress(taskId: string, listener: ProgressListener) {
    this.progressListeners.set(taskId, listener);
    return () => {
      this.progressListeners.delete(taskId);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l([...this.tasks]));
  }

  private saveToStorage() {
    try {
      localStorage.setItem('hyperpulse_tasks', JSON.stringify(this.tasks));
    } catch (_) {}
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('hyperpulse_tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (_) {
      this.tasks = [];
    }

    if (this.tasks.length === 0) {
      // Create a default initial task matching HyperPulse Flutter demo
      const initialTask: DownloadTask = {
        id: 'pulse_initial_ubuntu',
        sourceUrl: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso',
        fileName: 'ubuntu-24.04-desktop-amd64.iso',
        destinationDirectory: '/Downloads/HyperPulse',
        totalSizeBytes: 5900000000,
        downloadedBytes: 0,
        progress: 0,
        status: 'idle',
        threadCount: 16,
        segments: this.generateSegments(16, 5900000000),
        speedBytesPerSec: 0,
        etaSeconds: 0,
        ramBufferMb: 64,
        isVideo: false,
        provider: 'Ubuntu Canonical Official ISO CDN ⚡',
        addedAt: Date.now(),
      };
      this.tasks.push(initialTask);
    }
  }

  public generateSegments(count: number, totalBytes: number): SegmentChunk[] {
    const segments: SegmentChunk[] = [];
    const chunkSize = Math.floor(totalBytes / count);

    for (let i = 0; i < count; i++) {
      const start = i * chunkSize;
      const end = i === count - 1 ? totalBytes : (i + 1) * chunkSize - 1;
      segments.push({
        id: `seg_${i}`,
        index: i,
        startByte: start,
        endByte: end,
        downloadedBytes: 0,
        progress: 0,
        status: 'pending',
      });
    }
    return segments;
  }

  public async createAndStartTask(
    url: string,
    extractedMeta?: {
      title?: string;
      direct_url?: string;
      size?: number;
      format?: string;
      provider?: string;
      is_video?: boolean;
    }
  ): Promise<DownloadTask> {
    const settings = this.getSettings();
    const cleanUrl = extractedMeta?.direct_url || SmartUrlFilter.extractRealTargetUrl(url);

    let fileName = extractedMeta?.title;
    if (!fileName) {
      fileName = cleanUrl.split('/').pop()?.split('?')[0] || `HyperPulse_${Date.now()}`;
    }
    if (!fileName.includes('.')) {
      const ext = extractedMeta?.format || SmartUrlFilter.inferFileExtension(cleanUrl) || 'mp4';
      fileName = `${fileName}.${ext}`;
    }

    const totalBytes = extractedMeta?.size && extractedMeta.size > 0
      ? extractedMeta.size
      : Math.floor(Math.random() * 400000000) + 150000000; // ~150MB-550MB default

    const isVideo = extractedMeta?.is_video ?? (fileName.endsWith('.mp4') || fileName.endsWith('.mkv') || fileName.endsWith('.webm'));
    const threadCount = isVideo ? 1 : settings.threadConcurrency;

    const newTask: DownloadTask = {
      id: `pulse_${Date.now()}`,
      sourceUrl: cleanUrl,
      fileName,
      destinationDirectory: isVideo ? '/Downloads/HyperPulse/Videos' : '/Downloads/HyperPulse/Files',
      totalSizeBytes: totalBytes,
      downloadedBytes: 0,
      progress: 0,
      status: 'downloading',
      threadCount,
      segments: this.generateSegments(threadCount, totalBytes),
      speedBytesPerSec: 0,
      etaSeconds: 0,
      ramBufferMb: settings.ramBufferThresholdMb,
      isVideo,
      provider: extractedMeta?.provider || 'HyperPulse Direct Stream ⚡',
      addedAt: Date.now(),
    };

    this.tasks.unshift(newTask);
    this.notify();
    this.startDownloadLoop(newTask.id);
    return newTask;
  }

  public startDownloadLoop(taskId: string) {
    if (this.taskIntervals.has(taskId)) return;

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    this.tasks[taskIndex].status = 'downloading';
    this.notify();

    let targetSpeed = Math.floor(Math.random() * 35000000) + 25000000; // 25 MB/s to 60 MB/s
    if (this.tasks[taskIndex].isVideo) {
      targetSpeed = Math.floor(Math.random() * 18000000) + 12000000; // 12-30 MB/s for media stream
    }

    const interval = setInterval(() => {
      const index = this.tasks.findIndex((t) => t.id === taskId);
      if (index === -1) {
        this.stopDownloadLoop(taskId);
        return;
      }

      const t = this.tasks[index];
      if (t.status !== 'downloading') {
        this.stopDownloadLoop(taskId);
        return;
      }

      // Vary speed dynamically with realistic network fluctuation
      const speedFluctuation = (Math.random() - 0.5) * 6000000;
      const currentSpeed = Math.max(2000000, targetSpeed + speedFluctuation);
      t.speedBytesPerSec = currentSpeed;

      // Increment downloaded bytes (500ms step)
      const addedBytes = Math.floor(currentSpeed * 0.5);
      t.downloadedBytes = Math.min(t.totalSizeBytes, t.downloadedBytes + addedBytes);
      t.progress = Math.min(1.0, t.downloadedBytes / t.totalSizeBytes);

      // Calculate ETA
      const remainingBytes = t.totalSizeBytes - t.downloadedBytes;
      t.etaSeconds = Math.max(0, Math.ceil(remainingBytes / currentSpeed));

      // Update Segments progress
      const segCount = t.segments.length;
      for (let i = 0; i < segCount; i++) {
        const seg = t.segments[i];
        const targetSegBytes = seg.endByte - seg.startByte + 1;
        const segProgressTarget = t.progress;
        seg.downloadedBytes = Math.min(targetSegBytes, Math.floor(targetSegBytes * segProgressTarget));
        seg.progress = Math.min(1.0, seg.downloadedBytes / targetSegBytes);
        seg.status = seg.progress >= 1.0 ? 'completed' : 'active';
      }

      // Check completion
      if (t.progress >= 1.0 || t.downloadedBytes >= t.totalSizeBytes) {
        t.progress = 1.0;
        t.downloadedBytes = t.totalSizeBytes;
        t.status = 'completed';
        t.speedBytesPerSec = 0;
        t.etaSeconds = 0;
        t.completedAt = Date.now();
        t.segments.forEach((s) => {
          s.progress = 1.0;
          s.status = 'completed';
        });
        this.stopDownloadLoop(taskId);
      }

      const pListener = this.progressListeners.get(taskId);
      if (pListener) pListener({ ...t });

      this.notify();
    }, 500);

    this.taskIntervals.set(taskId, interval);
  }

  public stopDownloadLoop(taskId: string) {
    if (this.taskIntervals.has(taskId)) {
      clearInterval(this.taskIntervals.get(taskId));
      this.taskIntervals.delete(taskId);
    }
  }

  public pauseTask(taskId: string) {
    this.stopDownloadLoop(taskId);
    const index = this.tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      this.tasks[index].status = 'paused';
      this.tasks[index].speedBytesPerSec = 0;
      this.notify();
    }
  }

  public resumeTask(taskId: string) {
    this.startDownloadLoop(taskId);
  }

  public removeTask(taskId: string) {
    this.stopDownloadLoop(taskId);
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.notify();
  }

  public clearCompleted() {
    this.tasks = this.tasks.filter((t) => t.status !== 'completed');
    this.notify();
  }
}

export const downloadEngine = new DownloadEngineService();

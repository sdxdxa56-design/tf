export type DownloadStatus =
  | 'idle'
  | 'analyzing'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'error';

export interface SegmentChunk {
  id: string;
  index: number;
  startByte: number;
  endByte: number;
  downloadedBytes: number;
  progress: number; // 0.0 to 1.0
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface DownloadTask {
  id: string;
  sourceUrl: string;
  fileName: string;
  destinationDirectory: string;
  totalSizeBytes: number;
  downloadedBytes: number;
  progress: number; // 0.0 to 1.0
  status: DownloadStatus;
  threadCount: number;
  segments: SegmentChunk[];
  speedBytesPerSec: number;
  etaSeconds: number;
  ramBufferMb: number;
  isVideo: boolean;
  provider?: string;
  addedAt: number;
  completedAt?: number;
  errorMessage?: string;
}

export interface DeviceMetrics {
  totalRamMb: number;
  availableRamMb: number;
  logicalCores: number;
  currentNetworkSpeedMbps: number;
  latencyMs: number;
}

export interface ExtractionResult {
  success: boolean;
  direct_url?: string;
  title?: string;
  format?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
  uploader?: string;
  provider?: string;
  is_video?: boolean;
  error?: string;
}

export interface DetectedLink {
  rawUrl: string;
  cleanUrl: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'twitter' | 'direct' | 'other';
  detectedAt: number;
}

export interface AppSettings {
  ramBufferThresholdMb: number;
  threadConcurrency: number;
  autoExtractMp3: boolean;
  enableWatermark: boolean;
  stealthMode: boolean;
  soundEffects: boolean;
}

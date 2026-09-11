export interface SniffedMediaStream {
  id: string;
  url: string;
  title: string;
  platform: string;
  quality?: string;
  format: string;
  sizeBytes?: number;
  type: 'video' | 'audio' | 'hls_playlist' | 'binary';
  thumbnailUrl?: string;
  detectedAt: number;
}

export class VidmateSnifferEngine {
  private static STREAM_PATTERNS = [
    /\.mp4(?:\?|$)/i,
    /\.m3u8(?:\?|$)/i,
    /\.webm(?:\?|$)/i,
    /googlevideo\.com\/videoplayback/i,
    /fbcdn\.net\/v\//i,
    /cdninstagram\.com\/v\//i,
    /video\.twimg\.com/i,
    /v\.redd\.it/i,
    /tikwm\.com/i,
    /v16-webapp/i,
    /byteoversea/i,
    /media\.discordapp\.net/i,
  ];

  /**
   * Evaluates if a given URL matches video/media stream signature
   */
  public static isStreamUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    return this.STREAM_PATTERNS.some((pattern) => pattern.test(url));
  }

  /**
   * Generates VidMate-compatible JavaScript injection snippet for webviews
   */
  public static getInjectionScript(): string {
    return `
      (function() {
        if (window.__vidmate_sniffed__) return;
        window.__vidmate_sniffed__ = true;

        console.log("⚡ VidMate Stealth Sniffer Injected");

        function reportStream(url, title, quality) {
          if (!url || url.startsWith("blob:") || url.startsWith("data:")) return;
          if (window.VidMateBridge && window.VidMateBridge.onStreamFound) {
            window.VidMateBridge.onStreamFound(url, title || document.title, quality || "HD");
          }
        }

        // 1. DOM Video Elements Inspector
        function scanVideos() {
          const videos = document.querySelectorAll('video');
          videos.forEach(v => {
            if (v.src) reportStream(v.src, document.title, "HTML5 Stream");
            const sources = v.querySelectorAll('source');
            sources.forEach(s => {
              if (s.src) reportStream(s.src, document.title, s.type || "Source Stream");
            });
          });
        }

        // 2. Intercept XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
          if (typeof url === 'string' && (url.includes('.mp4') || url.includes('.m3u8') || url.includes('googlevideo') || url.includes('fbcdn') || url.includes('cdninstagram') || url.includes('video.twimg'))) {
            reportStream(url, document.title, "XHR Network Intercept");
          }
          return originalOpen.apply(this, arguments);
        };

        // 3. Intercept fetch()
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          const url = typeof input === 'string' ? input : (input && input.url);
          if (url && (url.includes('.mp4') || url.includes('.m3u8') || url.includes('googlevideo') || url.includes('fbcdn') || url.includes('cdninstagram') || url.includes('video.twimg'))) {
            reportStream(url, document.title, "Fetch Network Intercept");
          }
          return originalFetch.apply(this, arguments);
        };

        setInterval(scanVideos, 1200);
        scanVideos();
      })();
    `;
  }

  /**
   * Extract or sniff media format details from URL
   */
  public static parseStreamMeta(url: string, pageTitle?: string): SniffedMediaStream {
    const cleanTitle = (pageTitle || 'Extracted_Stream').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
    const isHls = url.includes('.m3u8');
    const isAudioOnly = url.includes('audio') || url.includes('.m4a') || url.includes('.mp3');

    let platform = 'Web Video';
    if (url.includes('googlevideo') || url.includes('youtube')) platform = 'YouTube';
    else if (url.includes('cdninstagram') || url.includes('instagram')) platform = 'Instagram';
    else if (url.includes('fbcdn') || url.includes('facebook')) platform = 'Facebook';
    else if (url.includes('video.twimg') || url.includes('twitter') || url.includes('x.com')) platform = 'Twitter/X';
    else if (url.includes('tikwm') || url.includes('tiktok') || url.includes('byteoversea')) platform = 'TikTok';

    return {
      id: `sniff_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      url,
      title: cleanTitle,
      platform,
      quality: isHls ? 'Adaptive HLS (1080p)' : '1080p Full HD',
      format: isAudioOnly ? 'm4a' : isHls ? 'm3u8' : 'mp4',
      type: isAudioOnly ? 'audio' : isHls ? 'hls_playlist' : 'video',
      detectedAt: Date.now(),
    };
  }
}

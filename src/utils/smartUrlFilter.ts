export class SmartUrlFilter {
  static isCleanAndSafe(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

    // Reject known malicious ad redirects or dangerous loops
    const dangerousDomains = [
      'doubleclick.net',
      'adservice.google.',
      'popads.net',
      'propellerads.com',
      'exoclick.com',
      'adf.ly',
    ];
    return !dangerousDomains.some((domain) => trimmed.includes(domain));
  }

  static extractRealTargetUrl(rawUrl: string): string {
    let clean = rawUrl.trim();
    try {
      const urlObj = new URL(clean);
      const searchParams = new URLSearchParams(urlObj.search);
      const trackingKeys = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'igshid',
        'gclid',
        'msclkid',
        'ref',
        'si',
      ];

      trackingKeys.forEach((key) => searchParams.delete(key));
      urlObj.search = searchParams.toString();
      return urlObj.toString();
    } catch (_) {
      return clean;
    }
  }

  static inferFileExtension(url: string): string | null {
    const cleanNoQuery = url.split('?')[0].toLowerCase();
    const match = cleanNoQuery.match(/\.([a-z0-9]{2,5})$/i);
    return match ? match[1] : null;
  }

  static detectPlatform(url: string): 'tiktok' | 'youtube' | 'instagram' | 'twitter' | 'direct' | 'other' {
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    if (this.inferFileExtension(url)) return 'direct';
    return 'other';
  }

  static formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec <= 0) return '0.0 MB/s';
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
  }

  static formatBytes(bytes: number): string {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static formatEta(seconds: number): string {
    if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--:--';
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }
}

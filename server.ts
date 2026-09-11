import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';

const app = express();
const PORT = 3000;

app.use(express.json());

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 14; Mobile; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.127 Mobile Safari/537.36';

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

// Extract YouTube ID
function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return match ? match[1] : null;
}

// TikTok TikWM Extractor
async function extractTikTok(url: string): Promise<ExtractionResult | null> {
  try {
    const resp = await axios.get('https://www.tikwm.com/api/', {
      params: { url, hd: 1 },
      timeout: 5000,
      headers: {
        'User-Agent': BROWSER_UA,
        Referer: 'https://www.tikwm.com/',
      },
    });

    if (resp.status === 200 && resp.data?.code === 0 && resp.data?.data) {
      const data = resp.data.data;
      let playUrl = data.play || data.hdplay || data.wmplay;
      if (playUrl) {
        if (playUrl.startsWith('/')) playUrl = `https://www.tikwm.com${playUrl}`;
        return {
          success: true,
          direct_url: playUrl,
          title: (data.title || `TikTok_Video_${Date.now()}`).replace(/[\\/:*?"<>|]/g, '_').slice(0, 70),
          format: 'mp4',
          size: data.size || 0,
          duration: data.duration || 0,
          thumbnail: data.cover,
          uploader: data.author?.nickname || data.author?.unique_id,
          provider: 'HyperPulse TikWM HD Engine ⚡',
          is_video: true,
        };
      }
    }
  } catch (_) {}
  return null;
}

// Invidious / SaveTube YouTube Extractor
async function extractYouTube(url: string): Promise<ExtractionResult | null> {
  const vidId = extractYouTubeId(url);
  if (!vidId) return null;

  // Try Invidious instances
  const instances = [
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://invidious.private.coffee',
    'https://yewtu.be',
  ];

  for (const host of instances) {
    try {
      const resp = await axios.get(`${host}/api/v1/videos/${vidId}`, {
        timeout: 4500,
        headers: { 'User-Agent': BROWSER_UA },
      });

      if (resp.status === 200 && resp.data) {
        const data = resp.data;
        const formatStreams = data.formatStreams || [];
        if (formatStreams.length > 0) {
          let chosen = formatStreams[0];
          for (const f of formatStreams) {
            if (f.qualityLabel?.includes('720') || f.qualityLabel?.includes('1080')) {
              chosen = f;
              break;
            }
          }
          if (chosen?.url) {
            let directUrl = chosen.url;
            if (directUrl.startsWith('/')) directUrl = `${host}${directUrl}`;
            return {
              success: true,
              direct_url: directUrl,
              title: (data.title || `YouTube_${vidId}`).replace(/[\\/:*?"<>|]/g, '_'),
              format: 'mp4',
              thumbnail: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`,
              duration: data.lengthSeconds,
              provider: `HyperPulse Invidious Engine (${host}) ⚡`,
              is_video: true,
            };
          }
        }
      }
    } catch (_) {}
  }

  // Fallback SaveTube
  try {
    const resp = await axios.get('https://cdn51.savetube.me/info', {
      params: { url: `https://www.youtube.com/watch?v=${vidId}` },
      timeout: 4500,
      headers: { 'User-Agent': BROWSER_UA },
    });
    if (resp.status === 200 && resp.data?.data?.video_formats?.length > 0) {
      const chosen = resp.data.data.video_formats[0];
      if (chosen.url) {
        return {
          success: true,
          direct_url: chosen.url,
          title: (resp.data.data.title || `YouTube_${vidId}`).replace(/[\\/:*?"<>|]/g, '_'),
          format: 'mp4',
          thumbnail: resp.data.data.thumbnail,
          provider: 'HyperPulse SaveTube CDN ⚡',
          is_video: true,
        };
      }
    }
  } catch (_) {}

  return null;
}

// Twitter / X VxTwitter Extractor
async function extractTwitter(url: string): Promise<ExtractionResult | null> {
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:[^\/]+)\/status(?:es)?\/(\d+)/i);
  if (!match) return null;
  const tweetId = match[1];

  try {
    const resp = await axios.get(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
      timeout: 4500,
      headers: { 'User-Agent': BROWSER_UA },
    });

    if (resp.status === 200 && resp.data) {
      const data = resp.data;
      const mediaList = data.media_extended || [];
      for (const m of mediaList) {
        if (m.type === 'video' || m.type === 'gif') {
          return {
            success: true,
            direct_url: m.url,
            title: (data.text || `Twitter_X_${tweetId}`).replace(/[\\/:*?"<>|]/g, '_').slice(0, 60),
            format: 'mp4',
            thumbnail: m.thumbnail_url,
            provider: 'HyperPulse VxTwitter Engine ⚡',
            is_video: true,
          };
        }
      }
    }
  } catch (_) {}
  return null;
}

// Instagram Extractor
async function extractInstagram(url: string): Promise<ExtractionResult | null> {
  try {
    const resp = await axios.post(
      'https://api.saveclip.app/v1/get',
      { url },
      { timeout: 4500, headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json' } }
    );
    if (resp.status === 200 && resp.data?.data?.length > 0) {
      const first = resp.data.data[0];
      const directUrl = first.url || first.video_url;
      if (directUrl) {
        return {
          success: true,
          direct_url: directUrl,
          title: `Instagram_Reel_${Date.now()}`,
          format: 'mp4',
          thumbnail: first.thumbnail,
          provider: 'HyperPulse SaveClip IG Engine 📸',
          is_video: true,
        };
      }
    }
  } catch (_) {}
  return null;
}

// Direct Link Inspector (HEAD Probe)
async function probeDirectUrl(url: string): Promise<ExtractionResult | null> {
  try {
    const headResp = await axios.head(url, {
      timeout: 4000,
      headers: { 'User-Agent': BROWSER_UA },
      maxRedirects: 5,
    });

    const contentType = String(headResp.headers['content-type'] || '').toLowerCase();
    const contentLength = parseInt(String(headResp.headers['content-length'] || '0'), 10);
    const contentDisposition = String(headResp.headers['content-disposition'] || '');

    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      return null;
    }

    let fileName = url.split('/').pop()?.split('?')[0] || `File_${Date.now()}`;
    const cdMatch = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
    if (cdMatch && cdMatch[1]) {
      fileName = cdMatch[1];
    }

    let format = fileName.split('.').pop() || 'bin';
    let isVideo = contentType.includes('video/') || ['mp4', 'mkv', 'webm', 'avi', 'mov'].includes(format.toLowerCase());

    return {
      success: true,
      direct_url: url,
      title: fileName.replace(/[\\/:*?"<>|]/g, '_'),
      format,
      size: contentLength > 0 ? contentLength : undefined,
      provider: 'HyperPulse Direct Network Probe ⚡',
      is_video: isVideo,
    };
  } catch (_) {
    // Check extension fallback
    const cleanNoQuery = url.split('?')[0].toLowerCase();
    const extensions = ['.mp4', '.apk', '.zip', '.iso', '.pdf', '.mkv', '.mp3', '.rar', '.7z', '.tar', '.gz'];
    if (extensions.some((ext) => cleanNoQuery.endsWith(ext))) {
      const fileName = url.split('/').pop()?.split('?')[0] || `Download_${Date.now()}`;
      const ext = fileName.split('.').pop() || 'bin';
      return {
        success: true,
        direct_url: url,
        title: fileName.replace(/[\\/:*?"<>|]/g, '_'),
        format: ext,
        provider: 'HyperPulse Direct Extension Prober ⚡',
        is_video: ['mp4', 'mkv', 'webm'].includes(ext.toLowerCase()),
      };
    }
    return null;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    engine: 'HyperPulse SpeedCore ⚡',
    version: '2.4.0',
    timestamp: Date.now(),
  });
});

app.post('/api/extract', async (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'رابط غير صالح (Invalid URL)' });
  }

  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();

  try {
    let result: ExtractionResult | null = null;

    if (lower.includes('tiktok.com')) {
      result = await extractTikTok(cleanUrl);
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      result = await extractYouTube(cleanUrl);
    } else if (lower.includes('twitter.com') || lower.includes('x.com')) {
      result = await extractTwitter(cleanUrl);
    } else if (lower.includes('instagram.com')) {
      result = await extractInstagram(cleanUrl);
    }

    if (!result) {
      result = await probeDirectUrl(cleanUrl);
    }

    if (result && result.success) {
      return res.json(result);
    }

    // Standard Fallback Metadata if extraction service is blocked
    const fallbackName = cleanUrl.split('/').pop()?.split('?')[0] || `HyperPulse_Media_${Date.now()}`;
    const isVid = lower.includes('video') || lower.includes('watch') || lower.includes('reel') || lower.includes('tiktok') || lower.includes('youtube');
    return res.json({
      success: true,
      direct_url: cleanUrl,
      title: fallbackName.length > 5 ? fallbackName : `HyperPulse_Download_${Date.now()}.mp4`,
      format: isVid ? 'mp4' : 'bin',
      provider: 'HyperPulse Direct Stream Fallback ⚡',
      is_video: isVid,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل استخراج الفيديو',
    });
  }
});

// Proxy Download Route for cross-origin downloads
app.get('/api/proxy-download', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) return res.status(400).send('Missing url parameter');

  try {
    const range = req.headers.range;
    const response = await axios({
      method: 'get',
      url: targetUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': BROWSER_UA,
        ...(range ? { range } : {}),
      },
    });

    res.status(response.status);
    Object.keys(response.headers).forEach((key) => {
      res.setHeader(key, response.headers[key] as string);
    });

    response.data.pipe(res);
  } catch (err: any) {
    res.status(500).send('Proxy Download Error: ' + err.message);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HyperPulse Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

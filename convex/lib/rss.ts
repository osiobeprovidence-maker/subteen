import { XMLParser } from 'fast-xml-parser';

export interface NormalizedFeedItem {
  title: string;
  link: string;
  guid?: string;
  pubDate?: string;
  publishedAt?: number;
  author?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  categories: string[];
}

interface RawItem {
  title?: unknown;
  link?: unknown;
  guid?: unknown;
  pubDate?: unknown;
  published?: unknown;
  updated?: unknown;
  author?: unknown;
  'dc:creator'?: unknown;
  description?: unknown;
  'content:encoded'?: unknown;
  content?: unknown;
  summary?: unknown;
  enclosure?: unknown;
  'media:content'?: unknown;
  'media:thumbnail'?: unknown;
  'media:group'?: unknown;
  category?: unknown;
  [key: string]: unknown;
}

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: '#cdata',
  trimValues: true,
  processEntities: true,
  parseTagValue: false,
});

type TextSource = unknown;

function asText(value: TextSource): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value.map((v) => asText(v)).join(' ').trim();
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj['#text'] === 'string') return obj['#text'].trim();
  if (typeof obj['#cdata'] === 'string') return obj['#cdata'].trim();
  return '';
}

function asUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim();
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === 'string');
    if (typeof first === 'string') return first.trim();
    return undefined;
  }
  const obj = value as Record<string, unknown>;
  const url = obj['@_url'] ?? obj['@_href'];
  return typeof url === 'string' ? url.trim() : undefined;
}

function firstImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : undefined;
}

function extractImage(item: RawItem): string | undefined {
  const candidates: unknown[] = [];
  if (item.enclosure) candidates.push(item.enclosure);
  if (item['media:content']) candidates.push(item['media:content']);
  if (item['media:thumbnail']) candidates.push(item['media:thumbnail']);
  if (item['media:group']) candidates.push(item['media:group']);
  for (const candidate of candidates) {
    const url = asUrl(candidate);
    if (url && /^(https?:\/\/)/i.test(url)) return url;
  }
  const content = asText(item['content:encoded']) || asText(item.content) || asText(item.description);
  const fromContent = firstImageFromContent(content);
  if (fromContent && /^(https?:\/\/)/i.test(fromContent)) return fromContent;
  return undefined;
}

/** Normalize a YouTube watch/shorts/embed URL to an embeddable player URL. */
function normalizeVideoUrl(raw: string): string | undefined {
  const trimmed = raw.trim();
  const m =
    trimmed.match(
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?[^#]*v=([A-Za-z0-9_-]{6,})/,
    ) ||
    trimmed.match(/^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    trimmed.match(/^https?:\/\/(?:www\.)?youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
  if (m) {
    return `https://www.youtube.com/embed/${m[1]}`;
  }
  const vimeo = trimmed.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d{6,})/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }
  const dm = trimmed.match(/^https?:\/\/(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dm) {
    return `https://www.dailymotion.com/embed/video/${dm[1]}`;
  }
  return undefined;
}

function videoUrlFromMedia(value: unknown): string | undefined {
  const obj = value as Record<string, unknown> | undefined;
  if (!obj || typeof obj !== 'object') return undefined;
  const type = asText(obj['@_type']) || asText(obj['@_medium']);
  const url = asUrl(obj['@_url']);
  if (/^video/i.test(type) && url) {
    return normalizeVideoUrl(url) ?? url;
  }
  return undefined;
}

function extractVideo(item: RawItem): string | undefined {
  const candidates: unknown[] = [];
  if (item.enclosure) candidates.push(item.enclosure);
  if (item['media:content']) candidates.push(item['media:content']);
  if (item['media:group']) candidates.push(item['media:group']);
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const c of candidate) {
        const url = videoUrlFromMedia(c);
        if (url) return url;
      }
    } else {
      const url = videoUrlFromMedia(candidate);
      if (url) return url;
    }
  }
  const content = asText(item['content:encoded']) || asText(item.content) || asText(item.description);
  if (!content) return undefined;
  const iframe = content.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframe) {
    const url = normalizeVideoUrl(iframe[1]);
    if (url) return url;
  }
  const linkMatch = content.match(/href=["']([^"']*youtube\.com\/watch\?v=[^"']+)["']/i);
  if (linkMatch) {
    const url = normalizeVideoUrl(linkMatch[1]);
    if (url) return url;
  }
  const bare = content.match(/(https?:\/\/[^\s"'<>]+(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)[^\s"'<>]*)/i);
  if (bare) {
    const url = normalizeVideoUrl(bare[1].replace(/[),.;]+$/, ''));
    if (url) return url;
  }
  return undefined;
}

function normalizeItem(item: RawItem): NormalizedFeedItem | null {
  const title = asText(item.title);
  const link = asUrl(item.link);
  if (!title || !link) return null;

  const pubDate =
    asText(item.pubDate) ||
    asText(item.published) ||
    asText(item.updated) ||
    undefined;
  const publishedAt = pubDate ? Date.parse(pubDate) : undefined;

  const description =
    asText(item.description) || asText(item['content:encoded']) || asText(item.summary) || undefined;

  const author = asText(item.author) || asText(item['dc:creator']) || undefined;

  const rawCategories = item.category;
  const categories: string[] = [];
  if (Array.isArray(rawCategories)) {
    for (const c of rawCategories) {
      const t = asText(c);
      if (t) categories.push(t);
    }
  } else {
    const t = asText(rawCategories);
    if (t) categories.push(t);
  }

  return {
    title,
    link,
    guid: asText(item.guid) || undefined,
    pubDate,
    publishedAt: Number.isFinite(publishedAt) ? publishedAt : undefined,
    author,
    description,
    imageUrl: extractImage(item),
    videoUrl: extractVideo(item),
    categories: categories.slice(0, 10),
  };
}

function itemsFromObject(value: unknown): RawItem[] {
  if (Array.isArray(value)) return value as RawItem[];
  if (value && typeof value === 'object') return [value as RawItem];
  return [];
}

/**
 * Parse an RSS 2.0 / Atom feed body into normalized items.
 * Returns an empty array on malformed input (never throws).
 */
export function parseFeed(xml: string): NormalizedFeedItem[] {
  try {
    const parsed = PARSER.parse(xml) as {
      rss?: { channel?: unknown };
      feed?: unknown;
      [key: string]: unknown;
    };
    let rawItems: RawItem[] = [];
    if (parsed.rss && typeof parsed.rss.channel === 'object') {
      const channel = parsed.rss.channel as { item?: unknown };
      rawItems = itemsFromObject(channel.item);
    } else if (parsed.feed) {
      const feed = parsed.feed as { entry?: unknown };
      rawItems = itemsFromObject(feed.entry);
    } else if (parsed.RDF) {
      const rdf = parsed.RDF as { item?: unknown };
      rawItems = itemsFromObject(rdf.item);
    }
    const items: NormalizedFeedItem[] = [];
    for (const raw of rawItems) {
      const normalized = normalizeItem(raw);
      if (normalized) items.push(normalized);
    }
    return items;
  } catch {
    return [];
  }
}

/** Fetch a feed body with a timeout. Throws on network/timeout errors. */
export async function fetchFeed(url: string, timeoutMs = 20000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Subteen-News-Automation/1.0 (+https://subteen.vercel.app; news-bot)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`Feed responded with HTTP ${response.status}`);
    }
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Feed returned an empty response');
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

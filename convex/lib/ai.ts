/**
 * Thin client for the Gemini API used by the news automation pipeline.
 * Uses the REST endpoint so it works inside Convex's Node runtime.
 */

export const DEFAULT_MODEL = 'gemini-3.1-flash-lite';
export const IMAGE_MODEL = 'gemini-2.5-flash-image';

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured on the Convex backend.');
  }
  return key;
}

interface GeminiCallOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

async function request(
  endpoint: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<unknown> {
  const key = apiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}:generateContent?key=${encodeURIComponent(key)}`;

  let attempt = 0;
  for (;;) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (response.ok) {
        return await response.json();
      }
      const detail = await response.text();
      const retryable = response.status === 429 || response.status === 503 || response.status >= 500;
      const retryAfter = Number(response.headers.get('retry-after'));
      if (retryable && attempt < 6) {
        const delay = retryAfter > 0 ? retryAfter * 1000 : 1500 * 2 ** attempt + Math.random() * 500;
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 300)}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

function textFromResponse(json: any): string {
  return (
    json?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text ?? '')
      .join('') ?? ''
  ).trim();
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options: GeminiCallOptions = {},
): Promise<string> {
  const json = await request(
    options.model ?? DEFAULT_MODEL,
    {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    },
    options.timeoutMs ?? 90000,
  );
  return textFromResponse(json);
}

/** Parse a JSON string that may be wrapped in code fences. */
export function parseJsonLoose(text: string): any {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    candidate = candidate.slice(start, end + 1);
  }
  return JSON.parse(candidate);
}

export interface DraftGenerationResult {
  headline: string;
  subheadline: string;
  summary: string;
  body: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  slug: string;
  keywords: string[];
}

export interface DraftSourceMaterial {
  title: string;
  description?: string;
  author?: string;
  publishedAt?: number;
  sourceName: string;
  categories: string[];
}

const SYSTEM_PROMPT = `You are the newsroom AI for Subteen, a gaming news and media publication.

Your job is to create an ORIGINAL Subteen editorial news draft from factual information provided about a story discovered via an RSS feed.

STRICT RULES:
- Write an original, professional gaming news report in Subteen's voice. Do NOT copy, paraphrase closely, or reproduce paragraphs from the original publication.
- Only use facts that are explicitly present in the provided source material.
- Do NOT invent quotes, statistics, dates, people, events, product details, claims, or anything not present in the source material. If a detail is missing, leave it out.
- Never include HTML, markdown link syntax to external articles, or scripts in the body. Plain markdown headings, lists, and emphasis are fine.
- Keep the body concise (150 to 320 words) with a clear intro, 2-3 short sections, and a short closing.
- Do not use clickbait. Headlines must be clear and accurate.
- Classify into one of these categories only: Gaming News, PlayStation, Xbox, Nintendo, PC Gaming, Mobile Gaming, Esports, Game Releases, Updates, Industry, Business, Reviews, Hardware. Choose the best single match.
- Return ONLY valid JSON with exactly these keys: headline, subheadline, summary, body, category, tags, seoTitle, seoDescription, slug, keywords.
  - headline: string
  - subheadline: one sentence explaining the significance
  - summary: short original summary (max 2 sentences)
  - body: markdown string
  - category: one of the categories above
  - tags: array of 3-6 short relevant tags (no commas inside tags)
  - seoTitle: under 60 chars
  - seoDescription: under 160 chars
  - slug: url-friendly version of the headline
  - keywords: array of 3-5 search keywords`;

export async function generateNewsDraft(material: DraftSourceMaterial): Promise<DraftGenerationResult> {
  const source = JSON.stringify(
    {
      original_title: material.title,
      description: material.description ?? '',
      author: material.author ?? '',
      published_at: material.publishedAt ? new Date(material.publishedAt).toISOString() : '',
      source: material.sourceName,
      feed_categories: material.categories,
    },
    null,
    2,
  );

  const text = await generateText(
    SYSTEM_PROMPT,
    `Source material:\n${source}\n\nGenerate the Subteen draft JSON now.`,
    { jsonMode: true, maxOutputTokens: 4096, temperature: 0.6 },
  );

  const parsed = parseJsonLoose(text);

  const clean = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') return value.trim();
    return fallback;
  };

  const toTags = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((t) => clean(t))
        .filter(Boolean)
        .slice(0, 6);
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6);
    }
    return [];
  };

  const headline = clean(parsed?.headline) || material.title;
  const body = clean(parsed?.body) || `# ${headline}\n\nA report based on recent coverage from ${material.sourceName}.`;
  const category = clean(parsed?.category) || 'Gaming News';

  return {
    headline,
    subheadline: clean(parsed?.subheadline),
    summary: clean(parsed?.summary),
    body,
    category,
    tags: toTags(parsed?.tags),
    seoTitle: clean(parsed?.seoTitle).slice(0, 60) || headline.slice(0, 60),
    seoDescription: clean(parsed?.seoDescription).slice(0, 160),
    slug: clean(parsed?.slug),
    keywords: toTags(parsed?.keywords),
  };
}

/** Generate an original featured image and return { mimeType, base64 }. */
export async function generateFeaturedImage(prompt: string): Promise<{
  mimeType: string;
  base64: string;
} | null> {
  try {
    const json = (await request(
      IMAGE_MODEL,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
      90000,
    )) as any;
    const parts: any[] = json?.candidates?.[0]?.content?.parts ?? [];
    const inline = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!inline) return null;
    return {
      mimeType: inline.inlineData.mimeType ?? 'image/png',
      base64: inline.inlineData.data,
    };
  } catch {
    return null;
  }
}

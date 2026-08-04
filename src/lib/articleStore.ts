export interface StoredArticle {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  slug: string;
  content: string;
  category: string;
  selectedGame: string;
  status: 'Draft' | 'Published' | 'Scheduled';
  isFeatured: boolean;
  isHomepage: boolean;
  coverData: string;
  createdAt: number;
  updatedAt: number;
}

const KEY = 'subteen_articles';

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function loadArticles(): StoredArticle[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArticles(articles: StoredArticle[]) {
  localStorage.setItem(KEY, JSON.stringify(articles));
}

export function getArticle(id: string): StoredArticle | null {
  return loadArticles().find((a) => a.id === id) ?? null;
}

export function getArticleBySlug(slug: string): StoredArticle | null {
  return loadArticles().find((a) => a.slug === slug) ?? null;
}

export function upsertArticle(article: StoredArticle): void {
  const all = loadArticles();
  const idx = all.findIndex((a) => a.id === article.id);
  if (idx >= 0) {
    all[idx] = article;
  } else {
    all.push(article);
  }
  writeArticles(all);
}

export function deleteArticle(id: string): void {
  writeArticles(loadArticles().filter((a) => a.id !== id));
}

export function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function objectUrlToDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        }),
    );
}

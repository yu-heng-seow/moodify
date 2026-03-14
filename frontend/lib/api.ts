const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const VERCEL_SHARE_SECRET = process.env.EXPO_PUBLIC_VERCEL_SHARE_SECRET;

export interface Song {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  streamUrl: string;
}

interface EmotionParagraphRequest {
  emotion: string;
  context?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE_URL}${path}${separator}_vercel_share=${VERCEL_SHARE_SECRET}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }

  return res.json();
}

/** Get a single random song matching a tag */
export function getRecommendation(tag: string): Promise<Song> {
  return request(`/api/recommend?tag=${encodeURIComponent(tag)}`);
}

/** Get all songs matching a tag, or all songs if tag is omitted */
export async function getRecommendations(tag?: string): Promise<Song[]> {
  try {
    const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
    console.log(`Fetching recommendations with query: ${query}`);
    return await request<Song[]>(`/api/recommends${query}`);
  } catch (err) {
    return [];
  }
}

/** Generate an emotion-based paragraph via Claude */
export function generateEmotionParagraph(
  emotion: string,
  context?: string,
): Promise<{ output: string }> {
  return request('/api/generate-emotion-paragraph', {
    method: 'POST',
    body: JSON.stringify({ emotion, context } satisfies EmotionParagraphRequest),
  });
}

/** Health check */
export function healthCheck(): Promise<{ status: string }> {
  return request('/health');
}

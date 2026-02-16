const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface JikanAnime {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; large_image_url?: string } };
  synopsis: string | null;
  episodes: number | null;
  type: string | null;
  status: string | null;
  score: number | null;
}

export interface JikanManga {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string; large_image_url?: string } };
  synopsis: string | null;
  chapters: number | null;
  volumes: number | null;
  type: string | null;
  status: string | null;
  score: number | null;
}

export async function searchAnime(
  query: string,
  limit = 10
): Promise<JikanAnime[]> {
  const res = await fetch(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Jikan API request failed");
  const data = await res.json();
  return data.data;
}

export async function searchManga(
  query: string,
  limit = 10
): Promise<JikanManga[]> {
  const res = await fetch(
    `${JIKAN_BASE}/manga?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Jikan API request failed");
  const data = await res.json();
  return data.data;
}

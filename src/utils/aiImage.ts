export function buildImageUrl(prompt: string, size = 768): string {
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = new URL('https://image.pollinations.ai/prompt');
  url.searchParams.set('width', String(size));
  url.searchParams.set('height', String(size));
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('enhance', 'true');
  url.searchParams.set('seed', String(seed));
  url.pathname += `/${encodeURIComponent(prompt)}`;
  return url.toString();
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

const CYRILLIC = /[а-яёА-ЯЁ]/;

export function hasCyrillic(text: string): boolean {
  return CYRILLIC.test(text);
}

export async function translateToEnglish(text: string): Promise<string> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', 'ru|en');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Translation failed');
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  const translated = data.responseData?.translatedText;
  if (!translated) throw new Error('Translation failed');
  return translated;
}
/**
 * The only module in the app that touches the network. It is called solely from the gift-idea form,
 * only when Settings → Privacy → "Link previews" is on, and the feature works without it.
 */
export interface LinkPreview {
  title?: string;
  imageUrl?: string;
}

function meta(html: string, name: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
  const alt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, 'i');
  const m = re.exec(html) ?? alt.exec(html);
  return m?.[1]?.trim();
}

export async function fetchLinkPreview(url: string, timeoutMs = 8000): Promise<LinkPreview | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'text/html' } });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000);
    const title = meta(html, 'og:title') ?? /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim();
    const imageUrl = meta(html, 'og:image');
    return title || imageUrl ? { title, imageUrl } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function extractUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = /https?:\/\/[^\s<>"']+/i.exec(text);
  return m ? m[0] : null;
}

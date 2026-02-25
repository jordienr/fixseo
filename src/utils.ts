export function normalizeUrl(u: string): string {
  try {
    return new URL(u).toString();
  } catch {
    return u;
  }
}

export function normalizeUrlKey(u: string): string {
  try {
    const url = new URL(u);
    return url.origin + url.pathname;
  } catch {
    return u;
  }
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function getDepth(url: string, baseUrl: string): number {
  try {
    const u = new URL(url);
    return u.pathname.split("/").filter(Boolean).length;
  } catch {
    return 0;
  }
}

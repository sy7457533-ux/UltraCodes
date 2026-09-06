/**
 * ProfileNest Browser - Input & Model Validation
 * Strictly validates user and IPC inputs to prevent injection and errors
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateProfileName(name: unknown): ValidationResult {
  if (typeof name !== 'string') {
    return { valid: false, error: 'Profile name must be a string.' };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Profile name cannot be empty.' };
  }
  if (trimmed.length > 64) {
    return { valid: false, error: 'Profile name cannot exceed 64 characters.' };
  }
  // Prevent path traversal characters in profile names used for folder generation
  if (/[\\/:*?"<>|]/.test(trimmed)) {
    return { valid: false, error: 'Profile name contains invalid characters (\\ / : * ? " < > |).' };
  }
  return { valid: true };
}

export function validateUrl(url: unknown): ValidationResult {
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL must be a string.' };
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: 'URL cannot be empty.' };
  }
  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only http and https protocols are supported.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

export function normalizeNavigationUrl(rawInput: string, searchEngineUrl: string = 'https://duckduckgo.com/?q='): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return 'about:blank';
  if (trimmed.startsWith('about:') || trimmed.startsWith('profilenest:')) return trimmed;

  // Check if it's already a full valid URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      // fallback to search
    }
  }

  // Check if it looks like a domain name with a TLD (e.g. example.com, en.wikipedia.org/wiki/...)
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Otherwise treat as search query
  return `${searchEngineUrl}${encodeURIComponent(trimmed)}`;
}

export function validateProxyConfig(proxy: {
  type: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
}): ValidationResult {
  if (!['none', 'http', 'https', 'socks5'].includes(proxy.type)) {
    return { valid: false, error: 'Unsupported proxy type. Choose none, http, https, or socks5.' };
  }

  if (proxy.type === 'none') {
    return { valid: true };
  }

  if (!proxy.host || typeof proxy.host !== 'string' || !proxy.host.trim()) {
    return { valid: false, error: 'Proxy host is required.' };
  }

  const portNum = Number(proxy.port);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Proxy port must be a valid integer between 1 and 65535.' };
  }

  return { valid: true };
}

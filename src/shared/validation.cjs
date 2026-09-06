/**
 * ProfileNest Browser - Input & Model Validation (CommonJS)
 */

function validateProfileName(name) {
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
  if (/[\\/:*?"<>|]/.test(trimmed)) {
    return { valid: false, error: 'Profile name contains invalid characters (\\ / : * ? " < > |).' };
  }
  return { valid: true };
}

function validateUrl(url) {
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

function validateProxyConfig(proxy) {
  if (!proxy || !['none', 'http', 'https', 'socks5'].includes(proxy.type)) {
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

module.exports = {
  validateProfileName,
  validateUrl,
  validateProxyConfig
};

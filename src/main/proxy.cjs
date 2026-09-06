/**
 * ProfileNest Browser - Proxy Manager
 * Standard networking proxy configuration for individual Chromium sessions
 * (HTTP, HTTPS, SOCKS5). No evasion or fingerprint spoofing.
 */

class ProxyManager {
  constructor(logger) {
    this.logger = logger;
    this.credentialsMap = new Map(); // session or host -> { username, password }
  }

  async applyProxyToSession(sessionInstance, proxyConfig) {
    if (!proxyConfig || proxyConfig.type === 'none' || !proxyConfig.host) {
      this.logger?.info('ProxyManager', 'Clearing proxy configuration (direct connection)');
      await sessionInstance.setProxy({ mode: 'direct' });
      return true;
    }

    let proxyRules = '';
    const hostPort = `${proxyConfig.host}:${proxyConfig.port}`;

    switch (proxyConfig.type) {
      case 'socks5':
        proxyRules = `socks5://${hostPort}`;
        break;
      case 'https':
        proxyRules = `https://${hostPort};http://${hostPort}`;
        break;
      case 'http':
      default:
        proxyRules = `http://${hostPort}`;
        break;
    }

    const proxyBypassRules = proxyConfig.bypass_list || '<local>';

    this.logger?.info('ProxyManager', `Applying proxy rules: ${proxyConfig.type}://${hostPort}`);

    await sessionInstance.setProxy({
      proxyRules,
      proxyBypassRules
    });

    // Store credentials for auth challenge
    if (proxyConfig.username && proxyConfig.password) {
      const key = `${proxyConfig.host}:${proxyConfig.port}`;
      this.credentialsMap.set(key, {
        username: proxyConfig.username,
        password: proxyConfig.password
      });

      // Handle session auth challenge
      sessionInstance.removeListener('login', this.handleLogin);
      sessionInstance.on('login', (event, authenticationResponseDetails, authInfo, callback) => {
        if (authInfo.isProxy) {
          const creds = this.credentialsMap.get(`${authInfo.host}:${authInfo.port}`) ||
                        this.credentialsMap.get(key);
          if (creds) {
            this.logger?.info('ProxyManager', `Supplying credentials for proxy ${authInfo.host}:${authInfo.port}`);
            callback(creds.username, creds.password);
            return;
          }
        }
        callback();
      });
    }

    return true;
  }
}

module.exports = ProxyManager;

const axios = require('axios');

const MAX_REDIRECTS = 10;

async function checkRedirects(startUrl) {
  const chain = [];
  const warnings = [];
  const visitedUrls = new Set();
  let currentUrl = startUrl;
  let totalTime = 0;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    // Check for redirect loop
    if (visitedUrls.has(currentUrl)) {
      warnings.push(`Redirect loop detected at: ${currentUrl}`);
      break;
    }

    // Check for too many redirects
    if (i === MAX_REDIRECTS) {
      warnings.push(`Too many redirects (exceeded ${MAX_REDIRECTS})`);
      break;
    }

    visitedUrls.add(currentUrl);

    const startTime = Date.now();
    let response;

    try {
      response = await axios.get(currentUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 100 && status < 400,
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; WhereGoes/1.0; +https://wheregoes.app)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
    } catch (err) {
      if (err.response) {
        // Got a response but status was redirect-like error (3xx handled as error by axios)
        response = err.response;
      } else {
        warnings.push(`Network error at ${currentUrl}: ${err.message}`);
        chain.push({
          url: currentUrl,
          status: null,
          statusText: 'Network Error',
          headers: {},
          responseTime: Date.now() - startTime,
          error: err.message,
        });
        break;
      }
    }

    const responseTime = Date.now() - startTime;
    totalTime += responseTime;

    const status = response.status;
    const headers = response.headers || {};

    chain.push({
      url: currentUrl,
      status,
      statusText: response.statusText || getStatusText(status),
      headers: sanitizeHeaders(headers),
      responseTime,
    });

    // Check if this is a redirect
    const isRedirect = [301, 302, 303, 307, 308].includes(status);
    if (!isRedirect) {
      // Final destination reached
      break;
    }

    const location = headers.location;
    if (!location) {
      warnings.push(`Redirect status ${status} but no Location header at: ${currentUrl}`);
      break;
    }

    // Resolve relative redirects
    try {
      currentUrl = new URL(location, currentUrl).href;
    } catch {
      warnings.push(`Invalid redirect URL: ${location}`);
      break;
    }
  }

  const finalUrl = chain.length > 0 ? chain[chain.length - 1].url : startUrl;

  return {
    chain,
    totalTime,
    finalUrl,
    warnings,
  };
}

function sanitizeHeaders(headers) {
  const result = {};
  const safeKeys = [
    'content-type',
    'location',
    'server',
    'x-powered-by',
    'cache-control',
    'expires',
    'pragma',
    'set-cookie',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'content-encoding',
    'transfer-encoding',
    'connection',
    'date',
    'last-modified',
    'etag',
    'vary',
    'access-control-allow-origin',
    'x-redirect-by',
    'referrer-policy',
    'content-security-policy',
    'x-cache',
    'cf-ray',
    'cf-cache-status',
  ];

  for (const key of safeKeys) {
    if (headers[key] !== undefined) {
      result[key] = headers[key];
    }
  }

  // Include any other x- prefixed headers
  for (const [k, v] of Object.entries(headers)) {
    if (k.startsWith('x-') && !result[k]) {
      result[k] = v;
    }
  }

  return result;
}

function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statusTexts[status] || 'Unknown';
}

module.exports = { checkRedirects };

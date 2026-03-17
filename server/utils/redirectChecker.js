const axios = require('axios');
const dns = require('dns').promises;
const cheerio = require('cheerio');
const { performance } = require('perf_hooks');

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

    let dnsTime = 0;
    try {
      const urlObj = new URL(currentUrl);
      const dnsStart = performance.now();
      await dns.lookup(urlObj.hostname);
      dnsTime = Math.round(performance.now() - dnsStart);
    } catch (err) {
      // DNS lookup failed, but let axios try anyway as it might have its own cache
    }

    const startTime = performance.now();
    let ttfb = 0;
    let response;

    try {
      response = await axios.get(currentUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 100 && status < 600,
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; WhereGoes/1.0; +https://wheregoes.app)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        onDownloadProgress: (progressEvent) => {
          if (ttfb === 0) {
            ttfb = Math.round(performance.now() - startTime);
          }
        },
      });
    } catch (err) {
      if (err.response) {
        response = err.response;
      } else {
        warnings.push(`Network error at ${currentUrl}: ${err.message}`);
        chain.push({
          url: currentUrl,
          status: null,
          statusText: 'Network Error',
          headers: {},
          responseTime: Math.round(performance.now() - startTime),
          dnsTime,
          error: err.message,
        });
        break;
      }
    }

    const responseTime = Math.round(performance.now() - startTime);
    if (ttfb === 0) ttfb = responseTime; // Fallback if onDownloadProgress didn't fire
    totalTime += responseTime;

    const status = response.status;
    const headers = response.headers || {};
    
    const step = {
      url: currentUrl,
      status,
      statusText: response.statusText || getStatusText(status),
      headers: sanitizeHeaders(headers),
      responseTime,
      dnsTime,
      ttfb,
    };

    // SEO Insights for the step (especially the final one)
    if (status >= 200 && status < 300 && response.data && typeof response.data === 'string') {
      const $ = cheerio.load(response.data);
      step.seo = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
        canonical: $('link[rel="canonical"]').attr('href'),
        h1: $('h1').first().text().trim(),
      };
    }

    // Redirect suggestion
    if (status === 302) {
      step.suggestion = "Consider using 301 if this move is permanent for better SEO.";
    } else if (status === 301) {
      step.suggestion = "Good! Using 301 for permanent redirects preserves SEO authority.";
    }

    chain.push(step);

    // Check if this is a redirect
    const isRedirect = [301, 302, 303, 307, 308].includes(status);
    if (!isRedirect) break;

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

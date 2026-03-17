const { checkRedirects } = require('../utils/redirectChecker');

async function handleRedirectCheck(req, res) {
  const { url } = req.body;

  try {
    const result = await checkRedirects(url);
    return res.json({
      success: true,
      url,
      ...result,
    });
  } catch (err) {
    console.error('Redirect check error:', err.message);

    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Request timed out. The server took too long to respond.',
      });
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(502).json({
        success: false,
        error: 'Could not reach the URL. Check if the domain exists and is reachable.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while tracing redirects.',
    });
  }
}

module.exports = { handleRedirectCheck };

const { checkRedirects } = require('../utils/redirectChecker');
const pLimit = require('p-limit');

async function handleBulkCheck(req, res) {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'An array of URLs is required' });
  }

  if (urls.length > 20) {
    return res.status(400).json({ error: 'Batch size limited to 20 URLs' });
  }

  const limit = pLimit(3); // Process 3 at a time
  const tasks = urls.map(url => limit(async () => {
    try {
      // Basic normalization if needed
      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      const result = await checkRedirects(normalizedUrl);
      return { url, success: true, ...result };
    } catch (err) {
      return { url, success: false, error: err.message };
    }
  }));

  try {
    const results = await Promise.all(tasks);
    res.json({ success: true, results });
  } catch (err) {
    console.error('Bulk check error:', err);
    res.status(500).json({ error: 'Bulk processing failed', details: err.message });
  }
}

module.exports = { handleBulkCheck };

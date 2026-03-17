function validateUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return res.status(400).json({ error: 'URL cannot be empty' });
  }

  // Prepend https:// if no protocol provided
  let finalUrl = trimmed;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = `https://${finalUrl}`;
  }

  try {
    const parsed = new URL(finalUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
    }
    // Attach normalized URL to body
    req.body.url = finalUrl;
    next();
  } catch {
    return res.status(400).json({ error: `Invalid URL: "${trimmed}"` });
  }
}

module.exports = { validateUrl };

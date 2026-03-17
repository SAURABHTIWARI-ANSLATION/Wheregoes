const axios = require('axios');
const { performance } = require('perf_hooks');

async function handleApiTest(req, res) {
  const { url, method = 'GET', headers = {}, body = null } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const startTime = performance.now();
  try {
    const response = await axios({
      url,
      method,
      headers: {
        'User-Agent': 'WhereGoes-ApiTester/1.0',
        ...headers
      },
      data: body,
      validateStatus: () => true, // Capture all statuses
      timeout: 15000
    });

    const duration = Math.round(performance.now() - startTime);

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
      request: {
        url,
        method,
        headers
      }
    });
  } catch (err) {
    const duration = Math.round(performance.now() - startTime);
    res.status(500).json({
      success: false,
      error: err.message,
      duration
    });
  }
}

module.exports = { handleApiTest };

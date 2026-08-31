const { put } = require('@vercel/blob');
const { isAuthenticated } = require('../_lib/session');

async function handler(req, res) {
  if (!isAuthenticated(req, process.env.SESSION_SECRET)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const filename = req.query.filename;
  if (typeof filename !== 'string' || !filename) {
    res.status(400).json({ error: 'filename query param is required' });
    return;
  }

  const body = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  const blob = await put(filename, body, {
    access: 'public',
    contentType: req.headers['content-type'] || 'application/octet-stream',
    addRandomSuffix: true,
  });

  res.status(200).json({ url: blob.url });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;

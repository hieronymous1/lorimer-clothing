const { put } = require('@vercel/blob');
const { isAuthenticated } = require('../_lib/session');
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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
  const contentType = req.headers['content-type'] || '';
  if (typeof filename !== 'string' || !filename) {
    res.status(400).json({ error: 'filename query param is required' });
    return;
  }
  if (!contentType.startsWith('image/')) {
    res.status(415).json({ error: 'only image uploads are allowed' });
    return;
  }
  if (Number(req.headers['content-length'] || 0) > MAX_UPLOAD_BYTES) {
    res.status(413).json({ error: 'image must be 10 MB or smaller' });
    return;
  }

  const body = await new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_UPLOAD_BYTES) {
        reject(Object.assign(new Error('image must be 10 MB or smaller'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  }).catch(error => {
    res.status(error.statusCode || 400).json({ error: error.message });
    return null;
  });
  if (!body) return;

  const blob = await put(filename, body, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });

  res.status(200).json({ url: blob.url });
}

handler.config = { api: { bodyParser: false } };
module.exports = handler;

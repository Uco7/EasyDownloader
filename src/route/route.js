const express = require('express');
const router = express.Router();
const {
  progressEmitter,
  getDownloadState,
  startDownload
} = require('../controler/appCont');

router.get('/', (req, res) => {
  const { downloadedFileName, logs } = getDownloadState();
  res.render('index', { downloadedFileName, logs });
});

router.get('/progress', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ progress: '0%' })}\n\n`);

  const onUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  progressEmitter.on('update', onUpdate);

  req.on('close', () => {
    progressEmitter.off('update', onUpdate);
  });
});

router.post('/download', async (req, res) => {
  const url = req.body.url?.trim();
  if (!url) return res.redirect('/');

  try {
    await startDownload(url);
    res.redirect('/');
  } catch (err) {
    console.error('Download error:', err);
    res.redirect('/');
  }
});

module.exports = router;

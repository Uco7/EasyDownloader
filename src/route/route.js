

// src/route/route.js
const express = require('express');
const router = express.Router();
const path = require('path');
const {
  progressEmitter,
  initState,
  getDownloadState,
  startDownload,
} = require('../controler/appCont');

// Define DOWNLOAD_DIR relative to this file (adjust if needed)
const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

// Serve index page, reset state on load
router.get('/', (req, res) => {
  initState();
  const { downloadedFileName, logs } = getDownloadState();
  res.render('index', { downloadedFileName, logs });
});

// SSE endpoint for progress updates
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

// POST /download - starts download then redirects (PRG pattern)
router.post('/download', (req, res) => {
  const url = req.body.url?.trim();
  if (!url) {
    return res.redirect('/');
  }

  initState();
  startDownload(url, DOWNLOAD_DIR);

  res.redirect('/');
});

module.exports = router;


// require('dotenv').config();
// const express = require('express');
// const path = require('path');

// const app = express();
// const port = process.env.PORT || 3000;
// const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/downloads', express.static(DOWNLOAD_DIR));
// app.set('view engine', 'ejs');

// // Import routes and pass app and download dir
// const router = require('./src/route/route');
// router(app, DOWNLOAD_DIR);

// app.listen(port, () => {
//   console.log(`✅ Server running at http://localhost:${port}`);
// });


// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { spawn } = require('child_process');
// const { EventEmitter } = require('events');

// module.exports = (app, DOWNLOAD_DIR) => {
//   const progressEmitter = new EventEmitter();
//   const YTDLP_PATH = process.env.YTDLP_PATH;

//   let downloadedFileName = '';
//   let logs = '';

//   app.get('/', (req, res) => {
//     downloadedFileName = '';
//     logs = '';
//     res.render('index', { downloadedFileName, logs });
//   });

//   app.get('/progress', (req, res) => {
//     res.set({
//       'Cache-Control': 'no-cache',
//       'Content-Type': 'text/event-stream',
//       'Connection': 'keep-alive',
//     });
//     res.flushHeaders();

//     res.write(`data: ${JSON.stringify({ progress: '0%' })}\n\n`);

//     const onUpdate = (data) => {
//       res.write(`data: ${JSON.stringify(data)}\n\n`);
//     };

//     progressEmitter.on('update', onUpdate);

//     req.on('close', () => {
//       progressEmitter.off('update', onUpdate);
//     });
//   });

//   app.post('/download', (req, res) => {
//     const url = req.body.url?.trim();
//     if (!url) {
//       logs = '❌ No URL provided';
//       return res.redirect('/');
//     }
//     downloadedFileName = '';
//     logs = '';
//     startDownload(url);
//     res.redirect('/');
//   });

//   function startDownload(url) {
//     if (!YTDLP_PATH) {
//       logs = '❌ yt-dlp executable path not set. Check your .env file.';
//       progressEmitter.emit('update', { error: logs });
//       return;
//     }

//     if (url.includes('tiktok.com')) {
//       // TikTok download logic (unchanged)
//       axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
//         .then(response => {
//           const videoLink = response.data?.data?.play;
//           if (!videoLink) {
//             logs = '❌ Failed to extract TikTok video URL.';
//             progressEmitter.emit('update', { error: logs });
//             return;
//           }

//           const fileName = `tiktok_${Date.now()}.mp4`;
//           const filePath = path.join(DOWNLOAD_DIR, fileName);

//           axios({
//             url: videoLink,
//             method: 'GET',
//             responseType: 'stream',
//           }).then(videoStream => {
//             const writer = fs.createWriteStream(filePath);
//             let downloaded = 0;
//             const total = parseInt(videoStream.headers['content-length'], 10);

//             videoStream.data.on('data', chunk => {
//               downloaded += chunk.length;
//               const percent = ((downloaded / total) * 100).toFixed(2);
//               progressEmitter.emit('update', { progress: percent + '%' });
//             });

//             videoStream.data.pipe(writer);

//             writer.on('finish', () => {
//               downloadedFileName = fileName;
//               logs = '✅ TikTok video downloaded successfully!';
//               progressEmitter.emit('update', { done: true, downloadedFileName });
//             });

//             writer.on('error', err => {
//               logs = '❌ Failed to write video: ' + err.message;
//               progressEmitter.emit('update', { error: logs });
//             });
//           });
//         })
//         .catch(error => {
//           logs = '❌ TikTok download failed: ' + error.message;
//           progressEmitter.emit('update', { error: logs });
//         });
//     } else {
//       const outputTemplate = '%(title).60s.%(ext)s';
//       const outputPath = path.join(DOWNLOAD_DIR, outputTemplate);

//       const ytProcess = spawn(YTDLP_PATH, ['-o', outputPath, url]);

//       ytProcess.stdout.on('data', data => {
//         const text = data.toString();
//         logs += text;
//         const progressMatch = text.match(/\[download\]\s+(\d+\.\d+)%/);
//         if (progressMatch) {
//           progressEmitter.emit('update', { progress: progressMatch[1] + '%' });
//         }
//       });

//       ytProcess.stderr.on('data', data => {
//         logs += data.toString();
//       });

//       ytProcess.on('close', () => {
//         const files = fs.readdirSync(DOWNLOAD_DIR);
//         const latestFile = files
//           .map(file => ({
//             name: file,
//             time: fs.statSync(path.join(DOWNLOAD_DIR, file)).mtime.getTime(),
//           }))
//           .sort((a, b) => b.time - a.time)[0]?.name || '';

//         downloadedFileName = latestFile;
//         progressEmitter.emit('update', { done: true, downloadedFileName });
//       });
//     }
//   }
// };
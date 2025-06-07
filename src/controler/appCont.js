// // src/controller/downloadController.js

// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { spawn } = require('child_process');
// const { EventEmitter } = require('events');

// const progressEmitter = new EventEmitter();

// let downloadedFileName = '';
// let logs = '';

// const initState = () => {
//   downloadedFileName = '';
//   logs = '';
// };

// const getDownloadState = () => ({ downloadedFileName, logs });

// const startDownload = (url, DOWNLOAD_DIR) => {
//   if (url.includes('tiktok.com')) {
//     axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
//       .then(response => {
//         const videoLink = response.data?.data?.play;
//         if (!videoLink) {
//           logs = '❌ Failed to extract TikTok video URL.';
//           progressEmitter.emit('update', { error: logs });
//           return;
//         }

//         const fileName = `tiktok_${Date.now()}.mp4`;
//         const filePath = path.join(DOWNLOAD_DIR, fileName);

//         axios({
//           url: videoLink,
//           method: 'GET',
//           responseType: 'stream',
//         }).then(videoStream => {
//           const writer = fs.createWriteStream(filePath);
//           let downloaded = 0;
//           const total = parseInt(videoStream.headers['content-length'], 10);

//           videoStream.data.on('data', chunk => {
//             downloaded += chunk.length;
//             const percent = ((downloaded / total) * 100).toFixed(2);
//             progressEmitter.emit('update', { progress: percent + '%' });
//           });

//           videoStream.data.pipe(writer);

//           writer.on('finish', () => {
//             downloadedFileName = fileName;
//             logs = '✅ TikTok video downloaded successfully!';
//             progressEmitter.emit('update', { done: true, downloadedFileName });
//           });

//           writer.on('error', err => {
//             logs = '❌ Failed to write video: ' + err.message;
//             progressEmitter.emit('update', { error: logs });
//           });
//         });
//       })
//       .catch(error => {
//         logs = '❌ TikTok download failed: ' + error.message;
//         progressEmitter.emit('update', { error: logs });
//       });

//   } else {
//     const outputTemplate = '%(title).60s.%(ext)s';
//     const outputPath = path.join(DOWNLOAD_DIR, outputTemplate);
//     const YTDLP_PATH = process.env.YTDLP_PATH;

//     if (!YTDLP_PATH) {
//       logs = '❌ YTDLP_PATH is not set in environment variables.';
//       progressEmitter.emit('update', { error: logs });
//       return;
//     }

//     const ytProcess = spawn(YTDLP_PATH, ['-o', outputPath, url]);

//     ytProcess.stdout.on('data', data => {
//       const text = data.toString();
//       logs += text;
//       const progressMatch = text.match(/\[download\]\s+(\d+\.\d+)%/);
//       if (progressMatch) {
//         progressEmitter.emit('update', { progress: progressMatch[1] + '%' });
//       }
//     });

//     ytProcess.stderr.on('data', data => {
//       logs += data.toString();
//     });

//     ytProcess.on('close', () => {
//       const files = fs.readdirSync(DOWNLOAD_DIR);
//       const latestFile = files
//         .map(file => ({
//           name: file,
//           time: fs.statSync(path.join(DOWNLOAD_DIR, file)).mtime.getTime(),
//         }))
//         .sort((a, b) => b.time - a.time)[0]?.name || '';

//       downloadedFileName = latestFile;
//       progressEmitter.emit('update', { done: true, downloadedFileName });
//     });
//   }
// };

// module.exports = {
//   progressEmitter,
//   initState,
//   getDownloadState,
//   startDownload,
// };
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');

const progressEmitter = new EventEmitter();

let downloadedFileName = '';
let logs = '';

// Define and ensure DOWNLOAD_DIR exists
const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const initState = () => {
  downloadedFileName = '';
  logs = '';
};

const getDownloadState = () => ({ downloadedFileName, logs });

const startDownload = (url) => {
  if (url.includes('tiktok.com')) {
    axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
      .then(response => {
        const videoLink = response.data?.data?.play;
        if (!videoLink) {
          logs = '❌ Failed to extract TikTok video URL.';
          progressEmitter.emit('update', { error: logs });
          return;
        }

        const fileName = `tiktok_${Date.now()}.mp4`;
        const filePath = path.join(DOWNLOAD_DIR, fileName);

        axios({
          url: videoLink,
          method: 'GET',
          responseType: 'stream',
        }).then(videoStream => {
          const writer = fs.createWriteStream(filePath);
          let downloaded = 0;
          const total = parseInt(videoStream.headers['content-length'], 10);

          videoStream.data.on('data', chunk => {
            downloaded += chunk.length;
            const percent = ((downloaded / total) * 100).toFixed(2);
            progressEmitter.emit('update', { progress: percent + '%' });
          });

          videoStream.data.pipe(writer);

          writer.on('finish', () => {
            downloadedFileName = fileName;
            logs = '✅ TikTok video downloaded successfully!';
            progressEmitter.emit('update', { done: true, downloadedFileName });
          });

          writer.on('error', err => {
            logs = '❌ Failed to write video: ' + err.message;
            progressEmitter.emit('update', { error: logs });
          });
        });
      })
      .catch(error => {
        logs = '❌ TikTok download failed: ' + error.message;
        progressEmitter.emit('update', { error: logs });
      });

  } else {
    const outputTemplate = '%(title).60s.%(ext)s';
    const outputPath = path.join(DOWNLOAD_DIR, outputTemplate);
    const YTDLP_PATH = process.env.YTDLP_PATH;

    if (!YTDLP_PATH) {
      logs = '❌ YTDLP_PATH is not set in environment variables.';
      progressEmitter.emit('update', { error: logs });
      return;
    }

    const ytProcess = spawn(YTDLP_PATH, ['-o', outputPath, url]);

    ytProcess.stdout.on('data', data => {
      const text = data.toString();
      logs += text;
      const progressMatch = text.match(/\[download\]\s+(\d+\.\d+)%/);
      if (progressMatch) {
        progressEmitter.emit('update', { progress: progressMatch[1] + '%' });
      }
    });

    ytProcess.stderr.on('data', data => {
      logs += data.toString();
    });

    ytProcess.on('close', () => {
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const latestFile = files
        .map(file => ({
          name: file,
          time: fs.statSync(path.join(DOWNLOAD_DIR, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time)[0]?.name || '';

      downloadedFileName = latestFile;
      progressEmitter.emit('update', { done: true, downloadedFileName });
    });
  }
};

module.exports = {
  progressEmitter,
  initState,
  getDownloadState,
  startDownload,
};

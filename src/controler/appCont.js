// // src/controller/downloadController.js

// const path = require('path');
// const fs = require('fs');
// const ytdlp = require('yt-dlp-exec');

// const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

// let downloadedFileName = '';
// let logs = '';

// // Reset state
// const initState = () => {
//   downloadedFileName = '';
//   logs = '';
// };

// // Get current state
// const getDownloadState = () => ({ downloadedFileName, logs });

// // Start download
// const startDownload = async (videoUrl) => {
//   initState();

//   try {
//     if (!videoUrl) {
//       logs = '❌ No URL provided.';
//       return;
//     }

//     // Ensure download directory exists
//     if (!fs.existsSync(DOWNLOAD_DIR)) {
//       fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
//     }

//     logs += '⏬ Downloading video...\n';

//     const outputTemplate = path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s');

//     // Execute yt-dlp with options
//     const output = await ytdlp(videoUrl, {
//       output: outputTemplate,
//       format: 'mp4',
//     });

//     logs += `✅ Video downloaded successfully!\n`;

//     // Extract filename (basic way)
//     const files = fs.readdirSync(DOWNLOAD_DIR);
//     const latestFile = files
//       .map(file => ({
//         file,
//         time: fs.statSync(path.join(DOWNLOAD_DIR, file)).mtime.getTime(),
//       }))
//       .sort((a, b) => b.time - a.time)[0];

//     downloadedFileName = latestFile.file;
//     logs += `📁 Saved as: ${downloadedFileName}`;

//   } catch (err) {
//     logs += `❌ Error: ${err.message}`;
//   }
// };

// module.exports = {
//   startDownload,
//   getDownloadState,
// };



const ytdlp = require('yt-dlp-exec');
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');

const progressEmitter = new EventEmitter();
const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

let downloadedFileName = '';
let logs = '';

function initState() {
  downloadedFileName = '';
  logs = '';
}

function getDownloadState() {
  return { downloadedFileName, logs };
}

function startDownload(url) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s');

    // Use .raw() to get a real child process
    const subprocess = ytdlp.raw(
      url,
      {
        output: outputTemplate,
        format: 'bestvideo+bestaudio',
        noWarnings: true,
        noPlaylist: true,
        progress: true,
        restrictFilenames: true,
        quiet: false // set to false if you want minimal logs
      }
    );

    subprocess.stdout.on('data', (data) => {
      const msg = data.toString();
      const match = msg.match(/(\d{1,3}\.\d)%/);
      if (match) {
        progressEmitter.emit('update', { progress: match[1] + '%' });
      }

      // Only keep relevant lines
      if (msg.includes('[youtube]') || msg.includes('Downloading')) {
        logs += msg;
      }
    });

    subprocess.stderr.on('data', (data) => {
      const errMsg = data.toString();

      // Only capture relevant error messages
      if (errMsg.includes('[youtube]') || errMsg.includes('ERROR') || errMsg.includes('WARNING')) {
        logs += errMsg;
      }
    });

    subprocess.on('close', (code) => {
      if (code === 0) {
        downloadedFileName = 'Download complete!';
        resolve('done');
      } else {
        reject(new Error('Download failed'));
      }
    });
  });
}

module.exports = {
  startDownload,
  getDownloadState,
  progressEmitter,
  initState
};

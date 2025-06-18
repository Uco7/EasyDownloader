// server.js
const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/downloads', express.static('downloads'));
app.use(express.urlencoded({ extended: true }));
app.get("/",(req,res)=>{
  res.render("index")
})

app.post('/download', (req, res) => {
  const url = req.body.url;

  execFile('python', ['yt_downloader.py', url], (error, stdout, stderr) => {
    if (error) {
      return res.json({ status: 'error', error: stderr || error.message });
    }

    try {
      const result = JSON.parse(stdout);
      if (result.status === 'success') {
        return res.json({
          status: 'success',
          downloadUrl: `/downloads/${encodeURIComponent(result.filename)}`
        });
      } else {
        return res.json(result);
      }
    } catch (err) {
      return res.json({ status: 'error', error: 'Invalid response from Python script.' });
    }
  });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));

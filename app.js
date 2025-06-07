
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Define the downloads directory absolute path
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(DOWNLOAD_DIR));

app.set('view engine', 'ejs');

// Import the router and use it as middleware
const routes = require('./src/route/route');
app.use('/', routes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});


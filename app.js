

const express = require("express");
const bodyParser=require("body-parser")
const path = require("path");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// View engine & static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.get("/",(req,res)=>{
  res.render("index")
})

app.post("/download", (req, res) => {
  const videoURL = req.body.url;
  const py = spawn("python", ["yt_downloader.py", videoURL]);

  let result = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (err) => {
    console.error("Python stderr:", err.toString());
  });

  py.on("close", () => {
    try {
      const json = JSON.parse(result.trim());
      if (json.status === "success") {
        res.json({
          status: "success",
          filename: json.filename
        });
      } else {
        res.json({ status: "error", error: json.error });
      }
    } catch (err) {
      console.error("❌ Failed to parse Python response:", result);
      res.json({ status: "error", error: "An unknown error occurred." });
    }
  });
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});


var express = require("express");
const app = express();
const port = process.env.PORT || '8000';

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'build')));

app.post("/single", upload.single("profile"), (req, res) => {
  try {
    res.send(req.file);
  } catch (err) {
    res.send(400);
  }
});

app.get("/", (req, res) => {
  res.send("hello people");
});

app.listen(port, () => {
  console.log("listening to the port: " + port);
});

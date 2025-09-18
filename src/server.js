const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = "mongodb+srv://omaryagoub:omaryagoubmangodb123@cluster0.mongodb.net/shopDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: "uploads",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ fileName: req.file.filename });
});

app.get("/image/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file || !file.contentType.startsWith("image")) {
      return res.status(404).json({ error: "Not an image or not found" });
    }

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get image" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

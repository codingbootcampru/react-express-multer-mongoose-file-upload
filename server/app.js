const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");

logger.info("connecting to MongoDB");

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(bodyParser.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

const imageSchema = new mongoose.Schema({
  name: String,
  desc: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Image2 = mongoose.model("Image2", imageSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log("test 123", file);
    // cb(null, file.fieldname + '-' + Date.now());
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    console.log("wrong file extension");
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter });

app.post("/api/uploads", upload.single("image"), async (req, res, next) => {
  console.log("POST !!!", req);
  try {
    const { filename, path: filepath, mimetype } = req.file;
    console.log(filename, filepath, mimetype);
    const image = new Image2;
    image.name = filename;
    image.desc = "image";
    image.img.data = fs.readFileSync(path.join(__dirname, filepath));
    image.img.contentType = mimetype;
    const result = await image.save();
    console.log(111, result);

    return res.status(201).json({
      message: "File uploded successfully",
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/api/uploads", (req, res) => {
  return res.send("ping ping");
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

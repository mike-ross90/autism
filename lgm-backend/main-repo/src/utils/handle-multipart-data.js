import multers3 from "multer-s3";
import multer from "multer";
import config from "../config/config.js";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

const s3 = new S3Client({
  region: config.S3_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export const Storage = multers3({
  s3: s3,
  bucket: config.S3_BUCKET_NAME,
  bucket: config.S3_BUCKET_NAME,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.originalname });
  },
  key: function (req, file, cb) {
    file.path = config.S3_DESTINATION + Date.now() + "-" + file.originalname;
    file.destination = config.S3_DESTINATION;
    cb(null, file.path);
  },
});

export const handle_multipart_data = multer({
  storage: Storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, callback) => {
    const FileTypes = /jpeg|jpg|png|gif|avif/;
    const mimType = FileTypes.test(file.mimetype);
    const extname = FileTypes.test(path.extname(file.originalname));
    if (mimType && extname) {
      return callback(null, true);
    }
    return callback(new Error("File type not supported"), false);
  },
});

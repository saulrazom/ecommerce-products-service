// src/config/env.js
require("dotenv").config();

module.exports = {
  awsRegion: process.env.AWS_REGION,
  productsTable: process.env.PRODUCTS_TABLE,
  s3BucketName: process.env.S3_BUCKET_NAME,
  // opcionales
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsProfile: process.env.AWS_PROFILE,
};
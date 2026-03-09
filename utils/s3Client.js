// src/utils/s3Client.js
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const config = require('../config/env');
const crypto = require('crypto');
const path = require('path');

const s3Client = new S3Client({
  region: config.awsRegion,
  // If credentials are provided explicitly (e.g. for local dev without IAM role)
  ...(config.awsAccessKeyId && config.awsSecretAccessKey && {
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey
    }
  })
});

/**
 * Uploads an image buffer directly to the configured S3 bucket
 *
 * @param {Buffer} fileBuffer The file buffer from multer
 * @param {string} mimetype The MIME type of the file
 * @param {string} originalName The original name of the file
 * @returns {Promise<string>} The public URL of the uploaded image
 */
const uploadImageToS3 = async (fileBuffer, mimetype, originalName) => {
  if (!config.s3BucketName) {
    throw new Error('S3_BUCKET_NAME is not configured in the environment');
  }

  // Generate a unique filename to prevent overwrites
  const ext = path.extname(originalName) || '';
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const key = `products/${uniqueName}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: config.s3BucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      // Optional: Set ACL to public-read if you want URLs to be directly accessible
      // without CloudFront or presigned URLs.
      // ACL: 'public-read'
    },
  });

  await upload.done();

  // Construct the public URL (Note: depends on bucket visibility settings)
  return `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;
};

module.exports = {
  s3Client,
  uploadImageToS3
};

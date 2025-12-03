import { S3Client } from '@aws-sdk/client-s3';

const s3Config = {
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: process.env.S3_USE_PATH_STYLE === 'true',
};

export const s3Client = new S3Client(s3Config);

export const S3_BUCKET = process.env.S3_BUCKET || 'digi-eventos';

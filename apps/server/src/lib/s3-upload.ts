import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from './s3-client';
import { randomUUID } from 'crypto';

export interface UploadOptions {
  folder?: string;
  originalName?: string;
  contentType?: string;
}

/**
 * Upload de arquivo para o S3/MinIO
 */
export async function uploadToS3(
  file: File | Buffer | string,
  options: UploadOptions = {}
): Promise<{ key: string; url: string }> {
  const { folder = 'general', originalName, contentType } = options;

  // Gera um nome único para o arquivo
  const extension = originalName?.split('.').pop() || '';
  const fileName = `${randomUUID()}${extension ? '.' + extension : ''}`;
  const key = `${folder}/${fileName}`;

  // Converte para Buffer se necessário
  let buffer: Buffer;
  let mimeType: string;

  if (typeof file === 'string') {
    // Se for string base64
    const base64Data = file.replace(/^data:[^;]+;base64,/, '');
    buffer = Buffer.from(base64Data, 'base64');
    
    // Detectar mime type do data URI se presente
    const match = file.match(/^data:([^;]+);base64,/);
    mimeType = match?.[1] ?? contentType ?? 'application/octet-stream';
  } else if (file instanceof File) {
    // Converte File para Buffer
    buffer = Buffer.from(await file.arrayBuffer());
    mimeType = file.type || contentType || 'application/octet-stream';
  } else {
    // Já é Buffer
    buffer = file;
    mimeType = contentType || 'application/octet-stream';
  }

  // Faz o upload
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Gera URL pública
  const url = `${process.env.S3_ENDPOINT}/${S3_BUCKET}/${key}`;

  return { key, url };
}

/**
 * Gera URL pré-assinada para download (válida por 1 hora)
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete um arquivo do S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}

/**
 * Extrai o key de uma URL S3
 */
export function extractS3Key(url: string): string | null {
  try {
    const match = url.match(new RegExp(`${S3_BUCKET}/(.+)$`));
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

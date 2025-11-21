import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || '792awss3';

// Upload audio file to S3
export async function uploadAudioToS3(
  file: Buffer,
  fileName: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const key = `podcasts/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Make the file publicly accessible
  });

  try {
    await s3Client.send(command);
    // Return the public S3 URL
    const region = process.env.AWS_REGION || 'us-east-2';
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload audio file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload image file to S3
export async function uploadImageToS3(
  file: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const key = `podcasts/covers/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Make the file publicly accessible
  });

  try {
    await s3Client.send(command);
    // Return the public S3 URL
    const region = process.env.AWS_REGION || 'us-east-2';
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error(`Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a presigned URL for public access (anyone can visit with the URL)
// Default expiration is 7 days (604800 seconds)
export async function getPresignedUrl(key: string, expiresIn: number = 604800): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

// Generate presigned URL directly from S3 URL
export async function getPresignedUrlFromS3Url(s3Url: string, expiresIn: number = 604800): Promise<string> {
  // Extract key from S3 URL
  // Format: https://bucket-name.s3.region.amazonaws.com/key
  const urlParts = s3Url.split('.amazonaws.com/');
  if (urlParts.length < 2) {
    throw new Error('Invalid S3 URL format');
  }
  
  const key = urlParts[1];
  return getPresignedUrl(key, expiresIn);
}

// Helper to validate audio file
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 500 * 1024 * 1024; // 100MB
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 100MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed types: MP3, WAV, OGG, M4A' };
  }

  return { valid: true };
}

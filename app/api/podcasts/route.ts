import { NextRequest, NextResponse } from 'next/server';
import { getPodcasts } from '@/lib/podcasts';
import { uploadAudioToS3, uploadImageToS3 } from '@/lib/s3';
import { addPodcast } from '@/lib/podcastStorage';

export async function GET() {
  try {
    const podcasts = await getPodcasts();
    return NextResponse.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Verify authentication
    const authKey = formData.get('authKey') as string;
    const UPLOAD_KEY = process.env.UPLOAD_AUTH_KEY;
    
    if (!authKey || authKey !== UPLOAD_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const audioFile = formData.get('audio') as File;
    const imageFile = formData.get('image') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = formData.get('duration') as string;
    const author = formData.get('author') as string;
    const episodeNumber = formData.get('episodeNumber') as string;
    const season = formData.get('season') as string;
    const keywordsString = formData.get('keywords') as string;
    const explicitString = formData.get('explicit') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (!title || !description || !duration) {
      return NextResponse.json(
        { error: 'Title, description, and duration are required' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/m4a'];

    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(audioFile.type) && !audioFile.name.endsWith('.mp3') && !audioFile.name.endsWith('.m4a')) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: MP3, WAV, OGG, M4A' },
        { status: 400 }
      );
    }

    // Validate image if provided
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const maxImageSize = 100 * 1024 * 1024; // 10MB
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (imageFile.size > maxImageSize) {
        return NextResponse.json(
          { error: 'Image size exceeds 10MB limit' },
          { status: 400 }
        );
      }

      if (!allowedImageTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Allowed types: JPG, PNG, WEBP' },
          { status: 400 }
        );
      }

      // Convert Image File to Buffer and upload
      const imageArrayBuffer = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      imageUrl = await uploadImageToS3(
        imageBuffer,
        imageFile.name,
        imageFile.type
      );
    }

    // Convert Audio File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const audioUrl = await uploadAudioToS3(
      buffer,
      audioFile.name,
      audioFile.type || 'audio/mpeg'
    );

    // Process keywords
    const keywords = keywordsString
      ? keywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : [];

    // Create podcast metadata with S3 URLs
    const podcastData = {
      title,
      description,
      duration,
      s3AudioUrl: audioUrl, // Store S3 URL
      s3ImageUrl: imageUrl, // Store S3 URL
      author: author || 'Unknown',
      episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
      season: season ? parseInt(season) : undefined,
      date: new Date().toISOString().split('T')[0],
      keywords,
      explicit: explicitString === 'true',
    };

    // Save podcast to Prisma database (will generate presigned URLs in response)
    const savedPodcast = await addPodcast(podcastData);

    return NextResponse.json({
      success: true,
      podcast: savedPodcast
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading podcast:', error);
    return NextResponse.json(
      { error: 'Failed to upload podcast', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

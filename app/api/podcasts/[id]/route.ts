import { NextRequest, NextResponse } from 'next/server';
import { updatePodcast, deletePodcast, getPodcastById } from '@/lib/podcastStorage';
import { uploadImageToS3, uploadAudioToS3 } from '@/lib/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const podcast = await getPodcastById(params.id);
    
    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcast' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = request.headers.get('content-type');
    let authKey: string;
    let title: string | undefined;
    let description: string | undefined;
    let duration: string | undefined;
    let author: string | undefined;
    let episodeNumber: number | undefined;
    let season: number | undefined;
    let keywords: string[] | undefined;
    let explicit: boolean | undefined;
    let imageUrl: string | undefined;
    let audioUrl: string | undefined;

    // Handle both JSON and FormData
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      authKey = formData.get('authKey') as string;
      title = formData.get('title') as string || undefined;
      description = formData.get('description') as string || undefined;
      duration = formData.get('duration') as string || undefined;
      author = formData.get('author') as string || undefined;
      
      const imageFile = formData.get('image') as File | null;
      const audioFile = formData.get('audio') as File | null;
      
      // Handle new fields
      const episodeNumberStr = formData.get('episodeNumber') as string;
      const seasonStr = formData.get('season') as string;
      const keywordsString = formData.get('keywords') as string;
      const explicitString = formData.get('explicit') as string;
      
      if (episodeNumberStr) {
        episodeNumber = parseInt(episodeNumberStr);
      }
      
      if (seasonStr) {
        season = parseInt(seasonStr);
      }
      
      if (keywordsString) {
        keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k.length > 0);
      }
      
      if (explicitString) {
        explicit = explicitString === 'true';
      }
      
      // Verify authentication
      const UPLOAD_KEY = process.env.UPLOAD_AUTH_KEY;
      
      if (!authKey || authKey !== UPLOAD_KEY) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Handle image upload if provided
      if (imageFile && imageFile.size > 0) {
        const maxImageSize = 10 * 1024 * 1024; // 10MB
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

      // Handle audio upload if provided
      if (audioFile && audioFile.size > 0) {
        const maxAudioSize = 100 * 1024 * 1024; // 100MB
        const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

        if (audioFile.size > maxAudioSize) {
          return NextResponse.json(
            { error: 'Audio size exceeds 100MB limit' },
            { status: 400 }
          );
        }

        if (!allowedAudioTypes.includes(audioFile.type)) {
          return NextResponse.json(
            { error: 'Invalid audio type. Allowed types: MP3, WAV, OGG, M4A' },
            { status: 400 }
          );
        }

        // Convert Audio File to Buffer and upload
        const audioArrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);
        audioUrl = await uploadAudioToS3(
          audioBuffer,
          audioFile.name,
          audioFile.type
        );
      }
      
      // Update podcast with all fields
      const updatedPodcast = await updatePodcast(params.id, {
        ...(title && { title }),
        ...(description && { description }),
        ...(duration && { duration }),
        ...(author !== undefined && { author }),
        ...(episodeNumber !== undefined && { episodeNumber }),
        ...(season !== undefined && { season }),
        ...(keywords !== undefined && { keywords }),
        ...(explicit !== undefined && { explicit }),
        ...(imageUrl && { s3ImageUrl: imageUrl }),
        ...(audioUrl && { s3AudioUrl: audioUrl }),
      });
      
      if (!updatedPodcast) {
        return NextResponse.json(
          { error: 'Podcast not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        podcast: updatedPodcast,
      });
    } else {
      const body = await request.json();
      authKey = body.authKey;
      title = body.title;
      description = body.description;
      duration = body.duration;
      author = body.author;
      
      // Verify authentication
      const UPLOAD_KEY = process.env.UPLOAD_AUTH_KEY;
      
      if (!authKey || authKey !== UPLOAD_KEY) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Update podcast (JSON mode - no new file uploads)
      const updatedPodcast = await updatePodcast(params.id, {
        ...(title && { title }),
        ...(description && { description }),
        ...(duration && { duration }),
        ...(author !== undefined && { author }),
      });
      
      if (!updatedPodcast) {
        return NextResponse.json(
          { error: 'Podcast not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        podcast: updatedPodcast,
      });
    }
  } catch (error) {
    console.error('Error updating podcast:', error);
    return NextResponse.json(
      { error: 'Failed to update podcast', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Verify authentication
    const authKey = body.authKey;
    const UPLOAD_KEY = process.env.UPLOAD_AUTH_KEY;
    
    if (!authKey || authKey !== UPLOAD_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete podcast
    const success = await deletePodcast(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Podcast not found or already deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Podcast deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return NextResponse.json(
      { error: 'Failed to delete podcast', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get title from query params
    const title = searchParams.get('title') || 'My Blog';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const author = searchParams.get('author') || 'Author';

    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #d0d0d0)',
            padding: '40px',
          }}
        >
          <div 
            style={{
              display: 'flex',
              fontSize: 28,
              fontWeight: 'normal',
              color: '#666',
              marginBottom: 8
            }}
          >
            {date} • {author}
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 'bold',
              lineHeight: 1.2,
              color: '#000',
              marginBottom: 40
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 32
            }}
          >
            My Blog
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(`Error generating OG image: ${(e as Error).message}`);
    return new Response("Failed to generate image", {
      status: 500,
    });
  }
}

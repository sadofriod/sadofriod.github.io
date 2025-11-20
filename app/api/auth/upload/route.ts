import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    const UPLOAD_KEY = process.env.UPLOAD_AUTH_KEY;
    
    if (!UPLOAD_KEY) {
      console.error('UPLOAD_AUTH_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (key === UPLOAD_KEY) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { error: 'Invalid authentication key' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

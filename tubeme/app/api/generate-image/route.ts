import Together from 'together-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'Together API key is required' },
        { status: 400 }
      );
    }

    const together = new Together({ apiKey });

    const enhancedPrompt = `${prompt}. Professional YouTube thumbnail background, vibrant colors, high contrast, no text, no words, no letters, 16:9 aspect ratio, photorealistic, high quality`;

    const response = await together.images.create({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: enhancedPrompt,
      width: 1280,
      height: 720,
      steps: 4,
      n: 1,
    });

    const imageUrl = response.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL returned from Together API' },
        { status: 500 }
      );
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error: unknown) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

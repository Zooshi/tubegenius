import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, apiKey } = await request.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Generate exactly 10 YouTube video titles for the following topic: "${topic}"

Requirements:
- Each title should be attention-grabbing and click-worthy
- Include numbers, power words, or curiosity gaps where appropriate
- Keep titles between 40-70 characters for optimal display
- Make them SEO-friendly with relevant keywords
- Vary the style (how-to, listicle, question, etc.)

Return ONLY the 10 titles, one per line, numbered 1-10.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const titles = text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 10);

    if (titles.length < 10) {
      return NextResponse.json(
        { error: 'Failed to generate 10 titles. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ titles });
  } catch (error: unknown) {
    console.error('Error generating titles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate titles: ${errorMessage}` },
      { status: 500 }
    );
  }
}

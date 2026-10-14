import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY || '';
  return NextResponse.json({
    hasOpenAiKey: Boolean(apiKey),
    keyPreview: apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : null,
  });
}

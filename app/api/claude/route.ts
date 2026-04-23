import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, messages, temperature } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: temperature ?? 0.7,
      system: systemPrompt,
      messages:
        messages && messages.length > 0
          ? messages
          : [{ role: 'user', content: 'Hello' }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const text =
      textContent && textContent.type === 'text' ? textContent.text : '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 },
    );
  }
}

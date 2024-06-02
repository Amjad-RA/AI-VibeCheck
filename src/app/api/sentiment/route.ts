import { pipeline } from '@xenova/transformers';

export async function POST(request: any) {
  const { text } = await request.json();

  if (!text) {
    return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
  }

  const sentiment = await pipeline('sentiment-analysis');
  const result = await sentiment(text);

  return new Response(JSON.stringify(result), { status: 200 });
}

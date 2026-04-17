import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userQuestion, context, grade } = req.body || {};
  if (!userQuestion || !grade) {
    return res.status(400).json({ error: 'Missing required fields: userQuestion, grade' });
  }

  const prompt = `You are a friendly, patient, and highly encouraging learning assistant for a child in ${grade}.

CONTEXT:
${context || ''}

STUDENT QUESTION/HINT REQUEST:
"${userQuestion}"

TASK:
Provide a simple, supportive explanation or a leading hint that helps the child find the answer on their own.
- Use simple vocabulary appropriate for ${grade}.
- DO NOT just give the answer directly.
- Encourage the child with positive reinforcement.
- Keep the explanation concise but thorough enough to teach the concept.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return res.status(200).json({ explanation: text });
  } catch (error: any) {
    console.error('Tutor explanation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get explanation' });
  }
}

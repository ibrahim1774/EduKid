import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { childName, grade, subject, struggles, topic } = req.body || {};
  if (!childName || !grade || !subject) {
    return res.status(400).json({ error: 'Missing required fields: childName, grade, subject' });
  }

  const prompt = `Generate a high-quality, comprehensive and fun daily lesson and worksheet for ${childName}, a ${grade} student.
Subject: ${subject}.
${topic ? `TOPIC: "${topic}".` : ''}
${struggles ? `CRITICAL: The student is specifically struggling with: "${struggles}".` : ''}

STRUCTURE:
1. LEARNING SECTION: Provide a DEEP, THOROUGH, and DETAILED lesson teaching the child the concept for today's topic (${topic || 'the lesson'}).
   - TARGET LENGTH: Approximately 1000 words total across all sections.
   - Write in a kid-friendly, engaging, and highly structured way for ${grade} level.
   - Content MUST be broken into these 5 specific fields:
     a) overview: "What You'll Learn Today" - Engaging intro, what we are doing, and simple goals.
     b) importance: "Why This Matters" - How this skill helps them, real-world connections, and building confidence.
     c) breakdown: "Step-by-Step Lesson Plan" - Clear instructions, rules, and definitions.
     d) example: "Let's Look at an Example" - A detailed worked-out example with logic.
     e) expectations: "What to Expect in Practice" - Encouragement and what the practice questions will be like.
   - CRITICAL: DO NOT use raw markdown formatting like asterisks (**), hashtags (#), or bolding markers in the body text fields. Use plain text with clear paragraph breaks.
2. PRACTICE SECTION: 10-15 varied problems directly related to the learning section.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": string,
  "topic": string,
  "learningContent": {
    "overview": string,
    "importance": string,
    "breakdown": string,
    "example": string,
    "expectations": string
  },
  "instructions": string,
  "questions": [
    {
      "text": string,
      "type": "multiple-choice" | "text" | "true-false",
      "options": string[] (only for multiple-choice),
      "correctAnswer": string,
      "explanation": string
    }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const data = JSON.parse(text);

    const worksheet = {
      title: data.title,
      topic: data.topic || topic || 'General Practice',
      learningContent: data.learningContent,
      instructions: data.instructions,
      questions: (data.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: `q-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      })),
      subject,
      grade,
    };

    return res.status(200).json(worksheet);
  } catch (error: any) {
    console.error('Worksheet generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate worksheet' });
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Subject, Worksheet, Question } from "../types";

/**
 * Generates brand illustrations.
 * Hyper-realistic, human-centric learning scenes.
 */
export const generateAppImage = async (promptId: number): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in process.env. Images may not load.");
  }
  
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  const prompts = [
    "Hyper-realistic 8k professional photograph of a young child with soft curly hair and a blue knit sweater, looking at a modern white tablet with an expression of pure joy and wonder. The room is filled with soft, warm afternoon sunlight. High-detail skin textures, authentic expression, cinematic depth of field, masterpiece quality.",
    "Close-up high-detail photograph of a parent's hands and a child's hands together, working on a clean, high-quality printed paper worksheet with colorful educational diagrams. Warm natural lighting, authentic textures of paper and pencil, grounded home setting, 8k resolution.",
    "Close-up photograph of a beautifully designed educational math worksheet on a wooden table. A child's hand points to a purple callout box which contains a helpful drawing of apples. Soft focus, realistic textures, professional educational material design.",
    "Studio product photography of a premium minimalist white printer in a bright modern study room. A stack of beautifully designed educational worksheets with colorful borders is neatly arranged next to it. Sharp focus, clean aesthetic, professional lighting, 8k resolution.",
    "Hyper-realistic wide shot of two children of different ages in a sunlit modern living room, one reading a book and one writing on a worksheet at a low table. Authentic family home atmosphere, luxury interior, soft natural window lighting, 8k resolution.",
    "Hyper-realistic photograph of a parent's hands using a modern laptop. The screen shows a clean interface with checkboxes for 'Math: Fractions' and 'Reading: Vocabulary'. A child is seen in the soft-focus background reading a book. Warm, professional, supportive home environment."
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompts[promptId] || prompts[0] }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return `https://picsum.photos/seed/edukid${promptId}/1200/800`;
  } catch (error) {
    console.error("Image generation failed", error);
    return `https://picsum.photos/seed/edukid${promptId}/1200/800`;
  }
};

/**
 * Generates a full worksheet based on child's grade and subject.
 */
export const generateWorksheetAction = async (childName: string, grade: Grade, subject: Subject): Promise<Partial<Worksheet>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `Generate a high-quality, fun daily worksheet for ${childName}, a ${grade} student.
  Subject: ${subject}. 
  Focus on grade-appropriate challenges. Include 10-15 varied problems.
  Return as valid JSON with title, instructions, and questions array.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instructions: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['multiple-choice', 'text', 'true-false'] },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING }
              },
              required: ['text', 'type']
            }
          }
        },
        required: ['title', 'instructions', 'questions']
      }
    }
  });

  try {
    const text = response.text;
    const data = JSON.parse(text || '{}');
    return {
      title: data.title,
      instructions: data.instructions,
      questions: (data.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: `q-${idx}`
      })),
      subject,
      grade
    };
  } catch (e) {
    console.error("Failed to parse worksheet JSON", e);
    throw e;
  }
};

/**
 * Provides pedagogical support for the student using the TutorView.
 */
export const getTutorExplanation = async (userQuestion: string, context: string, grade: Grade): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const prompt = `You are a friendly, patient, and highly encouraging learning assistant for a child in ${grade}.
  
  CONTEXT:
  ${context}
  
  STUDENT QUESTION/HINT REQUEST:
  "${userQuestion}"
  
  TASK:
  Provide a simple, supportive explanation or a leading hint that helps the child find the answer on their own. 
  - Use simple vocabulary appropriate for ${grade}.
  - DO NOT just give the answer directly. 
  - Encourage the child with positive reinforcement.
  - Keep the explanation concise but thorough enough to teach the concept.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "I'm sorry, I'm having a little trouble thinking right now. Can you try asking that in a different way?";
  } catch (error) {
    console.error("Tutor explanation failed:", error);
    return "I'm so sorry! My thinking gears are a bit stuck. Let's try that again in a moment.";
  }
};
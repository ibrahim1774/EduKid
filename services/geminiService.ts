import { GoogleGenAI, Type } from "@google/genai";
import { Grade, Subject, Worksheet, Question } from "../types";

/**
 * Generates brand illustrations.
 * Hyper-realistic, human-centric learning scenes.
 */
export const generateAppImage = async (promptId: number): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing! Using high-quality educational fallbacks instead of AI generation.");
    // Return high-quality educational fallbacks directly if key is missing
    const fallbacks = [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", // Child learning
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800",  // School/Education
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",  // Math/Science
      "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=800",  // Study setup
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200", // Family learning
      "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800"   // Books/Library
    ];
    return fallbacks[promptId] || fallbacks[0];
  }

  const ai = new GoogleGenAI({ apiKey });
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
      model: 'gemini-2.0-flash',
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
    return `https://source.unsplash.com/featured/?education,kid,learning&sig=${promptId}`;
  } catch (error) {
    console.error("AI Image generation failed (check your API key restriction/billing):", error);
    return `https://source.unsplash.com/featured/?education,kid,learning&sig=${promptId}`;
  }
};

/**
 * Generates a full worksheet based on child's grade and subject.
 */
export const generateWorksheetAction = async (childName: string, grade: Grade, subject: Subject, struggles?: string): Promise<Partial<Worksheet>> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
  const prompt = `Generate a high-quality, fun daily worksheet for ${childName}, a ${grade} student.
  Subject: ${subject}. 
  ${struggles ? `CRITICAL: The student is specifically struggling with: "${struggles}". Please include several targeted problems and clear examples addressing this struggle.` : 'Focus on grade-appropriate challenges.'}
  Include 10-15 varied problems.
  Return as valid JSON with title, instructions, and questions array.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
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
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
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
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || "I'm sorry, I'm having a little trouble thinking right now. Can you try asking that in a different way?";
  } catch (error) {
    console.error("Tutor explanation failed:", error);
    return "I'm so sorry! My thinking gears are a bit stuck. Let's try that again in a moment.";
  }
};
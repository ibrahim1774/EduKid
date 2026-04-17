import { Grade, Subject, Worksheet } from "../types";

/**
 * Returns educational fallback images (image generation not available).
 */
export const generateAppImage = async (promptId: number): Promise<string> => {
  const fallbacks = [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800",
    "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=800",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200",
    "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800",
  ];
  return fallbacks[promptId] || fallbacks[0];
};

/**
 * Generates a full worksheet via the /api/generate-worksheet serverless function.
 */
export const generateWorksheetAction = async (
  childName: string,
  grade: Grade,
  subject: Subject,
  struggles?: string,
  topic?: string
): Promise<Partial<Worksheet>> => {
  const res = await fetch('/api/generate-worksheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ childName, grade, subject, struggles, topic }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Worksheet generation failed (${res.status})`);
  }

  return res.json();
};

/**
 * Gets a tutor hint/explanation via the /api/tutor-explain serverless function.
 */
export const getTutorExplanation = async (
  userQuestion: string,
  context: string,
  grade: Grade
): Promise<string> => {
  try {
    const res = await fetch('/api/tutor-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userQuestion, context, grade }),
    });

    if (!res.ok) {
      return "I'm sorry, I'm having a little trouble thinking right now. Can you try asking that in a different way?";
    }

    const data = await res.json();
    return data.explanation || "I'm sorry, I'm having a little trouble thinking right now.";
  } catch {
    return "I'm so sorry! My thinking gears are a bit stuck. Let's try that again in a moment.";
  }
};

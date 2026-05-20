import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateExamQuestions } from '@/lib/gemini';

export const maxDuration = 60;

const fallbackExam = [
  {
    id: 1,
    question: "What should you do if the analysis fails?",
    type: "MCQ" as const,
    options: ["Give up", "Try uploading the document again", "Ignore it", "Blame the AI"],
    modelAnswer: "Try uploading the document again"
  }
];

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { base64, sessionId } = await request.json();

    if (!base64 || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const examQuestions = await generateExamQuestions(base64).catch(e => {
      console.error("Exam Fallback triggered:", e.message);
      return fallbackExam;
    });

    await adminDb.doc(`users/${uid}/sessions/${sessionId}`).update({
      examQuestions
    });

    return NextResponse.json({ success: true, examQuestions });
  } catch (error: any) {
    console.error("API Generate Exam Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getSectionTitles, generateSectionELI5 } from '@/lib/gemini';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const { base64, sessionId, action, sectionTitle } = await req.json();

    if (!base64 || !sessionId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionRef = adminDb.doc(`users/${decoded.uid}/sessions/${sessionId}`);

    if (action === 'init') {
      try {
        const sections = await getSectionTitles(base64);
        const eli5 = sections.map(s => ({
          section: s,
          simpleExplanation: "",
          analogy: "",
          isLoading: true
        }));
        await sessionRef.update({ eli5 });
        return NextResponse.json({ success: true });
      } catch (e: any) {
        console.error("ELI5 Init Error:", e.message);
        const fallbackELI5 = [{ section: "Analysis Failed", simpleExplanation: "We encountered an issue while generating this explanation. The AI model might have timed out or refused the content.", analogy: "It's like hitting a roadblock while exploring a new city.", isLoading: false }];
        await sessionRef.update({ eli5: fallbackELI5 });
        return NextResponse.json({ success: false });
      }
    } else if (action === 'chunk') {
      try {
        const sectionELI5 = await generateSectionELI5(base64, sectionTitle);
        
        // Fetch current session to update specific index
        const snap = await sessionRef.get();
        const data = snap.data();
        if (data && data.eli5) {
          const newEli5 = [...data.eli5];
          const index = newEli5.findIndex((s: any) => s.section === sectionTitle);
          if (index !== -1) {
            newEli5[index] = { ...sectionELI5, isLoading: false };
            await sessionRef.update({ eli5: newEli5 });
          }
        }
        return NextResponse.json({ success: true });
      } catch (e: any) {
        console.error(`ELI5 Chunk Error (${sectionTitle}):`, e.message);
        // On failure for a specific chunk, just mark it as not loading but failed
        const snap = await sessionRef.get();
        const data = snap.data();
        if (data && data.eli5) {
          const newEli5 = [...data.eli5];
          const index = newEli5.findIndex((s: any) => s.section === sectionTitle);
          if (index !== -1) {
            newEli5[index] = { section: sectionTitle, simpleExplanation: "Failed to generate explanation for this section.", analogy: "", isLoading: false };
            await sessionRef.update({ eli5: newEli5 });
          }
        }
        return NextResponse.json({ success: false });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

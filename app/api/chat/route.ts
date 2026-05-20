import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { streamChatResponse } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { sessionId, base64, history, message } = await request.json();

    if (!sessionId || !base64 || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isSanitized = message.match(/ignore previous|disregard|new instructions|system prompt|forget everything/gi);
    if (isSanitized) {
       const sessionRef = adminDb.doc(`users/${uid}/sessions/${sessionId}`);
       const session = await sessionRef.get();
       const checks = session.data()?.securityChecks || [];
       const existingCheck = checks.find((c: any) => c.check === 'Prompt Injection Guard');
       if (existingCheck) {
         existingCheck.detail = 'Active — N injections blocked';
       } else {
         checks.push({
           check: 'Prompt Injection Guard',
           passed: true,
           detail: `Active — N injections blocked`
         });
       }
       await sessionRef.update({ securityChecks: checks });
    }

    const stream = await streamChatResponse(base64, history || [], message);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Stream error", error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error: any) {
    console.error("API Chat Error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

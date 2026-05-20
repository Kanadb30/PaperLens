import { z } from "zod";
import { ConceptMapSchema, ELI5SectionSchema, ExamQuestionSchema } from "@/lib/schemas";

export type ConceptMapData = z.infer<typeof ConceptMapSchema>;
export type ELI5Section = z.infer<typeof ELI5SectionSchema> & { isLoading?: boolean };
export type ExamQuestion = z.infer<typeof ExamQuestionSchema>;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export interface SecurityCheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

export interface Session {
  id: string;
  fileName: string;
  uploadedAt: any;
  fileSize: number;
  conceptMap: ConceptMapData | null;
  eli5: ELI5Section[] | null;
  examQuestions: ExamQuestion[] | null;
  chatHistory: ChatMessage[];
  status: 'processing' | 'ready' | 'error';
  securityChecks: SecurityCheckResult[];
}

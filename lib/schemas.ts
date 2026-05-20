import { z } from "zod";

export const ConceptNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['concept', 'method', 'result', 'author']),
});

export const ConceptEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  relation: z.string(),
});

export const ConceptMapSchema = z.object({
  nodes: z.array(ConceptNodeSchema),
  edges: z.array(ConceptEdgeSchema),
});

export const ELI5SectionSchema = z.object({
  section: z.string(),
  simpleExplanation: z.string(),
  analogy: z.string(),
});

export const ELI5Schema = z.array(ELI5SectionSchema);

export const ExamQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  type: z.enum(['MCQ', 'short', 'long']),
  options: z.array(z.string()).optional(),
  modelAnswer: z.string(),
});

export const ExamSchema = z.array(ExamQuestionSchema);

import { z } from "zod";

export const quizItemSchema = z.object({
  scenario: z.string().optional(),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correct: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const exerciseSchema = z
  .object({
    prompt: z.string().min(1),
    accept: z.array(z.string().min(1)).min(1),
    hint: z.string().optional(),
    solution: z.string().min(1),
  })
  .optional();

export const hookSchema = z.object({
  situation: z.string().min(1),
  question: z.string().min(1),
});

export const lessonFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "id must be kebab-case"),
  title: z.string().min(1),
  summary: z.string().min(1),
  prerequisites: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().positive().default(10),
  group: z.string().optional(),
  visual: z.string().optional(),
  visualCaption: z.string().optional(),
  hook: hookSchema,
  exercise: exerciseSchema,
  quiz: z.array(quizItemSchema).min(1),
  passThreshold: z.number().int().min(1).optional(),
});

export type Hook = z.infer<typeof hookSchema>;

export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type QuizItem = z.infer<typeof quizItemSchema>;
export type Exercise = NonNullable<z.infer<typeof exerciseSchema>>;

export const graphNodeSchema = z.object({
  id: z.string(),
  group: z.string().optional(),
});

export const graphSchema = z.object({
  nodes: z.array(graphNodeSchema).min(1),
});

export type GraphNode = z.infer<typeof graphNodeSchema>;
export type Graph = z.infer<typeof graphSchema>;

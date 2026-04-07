import { z } from "zod";

export const meetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  date: z.string().min(1, "Date is required"),
  duration: z.number().int().positive().optional(),
  attendees: z.array(z.string()).default([]),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  action_items: z.array(z.object({
    text: z.string(),
    assignee: z.string().optional(),
    done: z.boolean().default(false),
  })).default([]),
  status: z.enum(["draft", "analyzed", "completed"]).default("draft"),
});

export const insightSchema = z.object({
  meeting_id: z.string().uuid("Invalid meeting ID"),
  type: z.enum(["action_item", "decision", "sentiment", "topic", "general"]).default("general"),
  content: z.string().min(1, "Content is required"),
  sentiment_score: z.number().min(-1).max(1).optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message is required"),
});

export const profileSchema = z.object({
  full_name: z.string().max(255).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type MeetingInput = z.infer<typeof meetingSchema>;
export type InsightInput = z.infer<typeof insightSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import { supabase } from "@/integrations/supabase/client";
import { meetingSchema, insightSchema, profileSchema } from "./schemas";
import type { ApiResponse } from "./schemas";
import type { Meeting, Insight, Profile, ChatMessage } from "@/types";
import type { Json } from "@/integrations/supabase/types";

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// --- Meetings ---

export async function getMeetings(): Promise<ApiResponse<Meeting[]>> {
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getMeeting(id: string): Promise<ApiResponse<Meeting>> {
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createMeeting(input: unknown): Promise<ApiResponse<Meeting>> {
  try {
    const user = await getUser();
    const parsed = meetingSchema.parse(input);
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        user_id: user.id,
        title: parsed.title,
        date: parsed.date,
        duration: parsed.duration,
        attendees: parsed.attendees as unknown as Json,
        transcript: parsed.transcript,
        summary: parsed.summary,
        action_items: parsed.action_items as unknown as Json,
        status: parsed.status,
      })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Validation failed" };
  }
}

export async function updateMeeting(id: string, input: unknown): Promise<ApiResponse<Meeting>> {
  try {
    const user = await getUser();
    const parsed = meetingSchema.partial().parse(input);
    const { data, error } = await supabase
      .from("meetings")
      .update({
        ...parsed,
        attendees: parsed.attendees as unknown as Json,
        action_items: parsed.action_items as unknown as Json,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

export async function deleteMeeting(id: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

// --- Insights ---

export async function getInsights(meetingId?: string): Promise<ApiResponse<Insight[]>> {
  try {
    const user = await getUser();
    let query = supabase
      .from("insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (meetingId) query = query.eq("meeting_id", meetingId);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createInsight(input: unknown): Promise<ApiResponse<Insight>> {
  try {
    const user = await getUser();
    const parsed = insightSchema.parse(input);
    const { data, error } = await supabase
      .from("insights")
      .insert({ ...parsed, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Validation failed" };
  }
}

export async function deleteInsight(id: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    const { error } = await supabase
      .from("insights")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

// --- Chat History ---

export async function getChatHistory(): Promise<ApiResponse<ChatMessage[]>> {
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function saveChatMessage(role: string, content: string): Promise<ApiResponse<ChatMessage>> {
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from("chat_history")
      .insert({ user_id: user.id, role, content })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function clearChatHistory(): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    const { error } = await supabase
      .from("chat_history")
      .delete()
      .eq("user_id", user.id);
    if (error) throw error;
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Clear failed" };
  }
}

// --- Profile ---

export async function getProfile(): Promise<ApiResponse<Profile>> {
  try {
    const user = await getUser();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateProfile(input: unknown): Promise<ApiResponse<Profile>> {
  try {
    const user = await getUser();
    const parsed = profileSchema.parse(input);
    const { data, error } = await supabase
      .from("profiles")
      .update(parsed)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed" };
  }
}

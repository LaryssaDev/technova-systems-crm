import { supabase } from "./supabase";
import { TimeClockEntry } from "../types";

const TABLE_NAME = "time_clock";

export const pontoService = {
  async addEntry(data: Omit<TimeClockEntry, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as TimeClockEntry;
  },

  async getEntries() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return data as TimeClockEntry[];
  },

  async getEntriesByPeriod(userId: string | null, startDate: string, endDate: string) {
    let query = supabase
      .from(TABLE_NAME)
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("timestamp", { ascending: true });

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as TimeClockEntry[];
  }
};

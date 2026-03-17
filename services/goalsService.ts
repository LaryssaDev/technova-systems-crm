import { supabase } from "./supabase";
import { MonthlyGoal } from "../types";

const TABLE_NAME = "goals";

export const goalsService = {
  async addItem(data: MonthlyGoal) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert([data]);

    if (error) throw error;
    return data;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*");

    if (error) throw error;
    return data as MonthlyGoal[];
  },

  async updateGoal(month: string, data: Partial<MonthlyGoal>) {
    const { data: existing, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("month", month)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw fetchError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update(data)
        .eq("month", month);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from(TABLE_NAME)
        .insert([{ month, ...data, reachedValue: 0, isCompleted: false }]);

      if (insertError) throw insertError;
    }
  }
};

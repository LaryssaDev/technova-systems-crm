import { supabase } from "./supabase";
import { FinancialEntry } from "../types";

const TABLE_NAME = "financial_entries";

export const financeiroService = {
  async addItem(data: Omit<FinancialEntry, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as FinancialEntry;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return data as FinancialEntry[];
  },

  async updateItem(id: string, data: Partial<FinancialEntry>) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq("id", id);

    if (error) throw error;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

import { supabase } from "./supabase";
import { FixedCost } from "../types";

const TABLE_NAME = "fixed_costs";

export const custosFixosService = {
  async addItem(data: Omit<FixedCost, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as FixedCost;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("dueDate", { ascending: true });

    if (error) throw error;
    return data as FixedCost[];
  },

  async updateItem(id: string, data: Partial<FixedCost>) {
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

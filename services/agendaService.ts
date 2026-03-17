import { supabase } from "./supabase";
import { Meeting } from "../types";

const TABLE_NAME = "meetings";

export const agendaService = {
  async addItem(data: Omit<Meeting, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as Meeting;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    return data as Meeting[];
  },

  async updateItem(id: string, data: Partial<Meeting>) {
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

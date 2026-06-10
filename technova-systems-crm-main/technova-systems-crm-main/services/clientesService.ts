import { supabase } from "./supabase";
import { Client } from "../types";

const TABLE_NAME = "clients";

export const clientesService = {
  async addItem(data: Omit<Client, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as Client;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data as Client[];
  },

  async updateItem(id: string, data: Partial<Client>) {
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

import { supabase } from "./supabase";
import { Tabulation } from "../types";

const TABLE_NAME = "tabulations";

export const tabulacaoService = {
  async addItem(data: Omit<Tabulation, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as Tabulation;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data as Tabulation[];
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("clientId", clientId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data as Tabulation[];
  },

  async updateItem(id: string, data: Partial<Tabulation>) {
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

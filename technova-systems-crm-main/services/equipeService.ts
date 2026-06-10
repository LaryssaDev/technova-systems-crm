import { supabase } from "./supabase";
import { User } from "../types";

const TABLE_NAME = "users";

export const equipeService = {
  async addItem(data: Omit<User, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result as User;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as User[];
  },

  async updateItem(id: string, data: Partial<User>) {
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

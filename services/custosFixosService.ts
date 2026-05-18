import { supabase } from "./supabase";
import { FixedCost } from "../types";

const TABLE_NAME = "fixed_costs";

const mapToDB = (data: Partial<FixedCost>) => {
  const mapped: any = { ...data };
  if (mapped.currentInstallment !== undefined) {
    mapped.current_installment = mapped.currentInstallment;
    delete mapped.currentInstallment;
  }
  return mapped;
};

const mapFromDB = (data: any): FixedCost => {
  return {
    ...data,
    currentInstallment: data.current_installment !== undefined ? data.current_installment : data.currentInstallment
  };
};

export const custosFixosService = {
  async addItem(data: Omit<FixedCost, "id">) {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([mapToDB(data as FixedCost)])
      .select()
      .single();

    if (error) throw error;
    return mapFromDB(result);
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("dueDate", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapFromDB);
  },

  async updateItem(id: string, data: Partial<FixedCost>) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(mapToDB(data))
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

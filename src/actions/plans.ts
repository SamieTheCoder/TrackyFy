"use server";
import supabase from "@/config/supabase-config";

export const addNewPlan = async (payload: any) => {
  try {
    const { data, error } = await supabase.from("plans").insert(payload);
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Plan added Successfully",
    };
  } catch (error: any) {
    console.error("❌ Error adding plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllPlans = async () => {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("❌ Error fetching plans:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const editPlanById = async (id: string, payload: any) => {
  try {
    const { data, error } = await supabase
      .from("plans")
      .update(payload)
      .match({ id });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Plan Updated successfully",
    };
  } catch (error: any) {
    console.error("❌ Error updating plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getPlanById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: data?.[0],
    };
  } catch (error: any) {
    console.error("Error fetching plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deletePlanById = async (id: string) => {
  try {
    const { data, error } = await supabase.from("plans").delete().match({ id });
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Plan deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

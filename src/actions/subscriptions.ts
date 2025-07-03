"use server";

import supabase from "@/config/supabase-config";
import dayjs from "dayjs";

export const createNewSubscription = async (payload: any) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([payload]);
    if (error) {
      throw new Error(error.message);
    }

    // mark the is_customer flag as true in the user_profiles table
    await supabase.from("user_profiles").upsert({
      id: payload.user_id,
      is_customer: true,
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getCurrentUserActiveSubscription = async (user_id: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("* , plans(*)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) {
      return {
        success: false,
        data: null,
      };
    }
    const sub = data[0];
    if (dayjs(sub.end_date, "YYYY-MM-DD").isBefore(dayjs())) {
      return {
        success: false,
        data: null,
      };
    }
    sub.plan = sub.plans;
    return {
      success: true,
      data: sub,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllSubscriptionsOfUser = async (user_id: string) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("* , plans(*)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    let formattedData = data.map((item: any) => ({
      plan: item.plans,
      ...item,
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("* , plans(name) , user_profiles(name, email), coupons(code)")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    let formattedData = data.map((item: any) => ({
      plan: item.plans,
      user: item.user_profiles,
      coupon: item.coupons,
      ...item,
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

/* ---------------  delete subscription --------------- */
export const deleteSubscription = async (subscriptionId: number) => {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) throw error;
    return { success: true, message: "Subscription removed 🗑️" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
};

/* ---------------  invoice download helper --------------- */
/* Made async to comply with Server Actions requirement */
export const getInvoiceDownloadUrl = async (subId: number) => {
  // In real life you would generate & store a pdf
  // For demo we return a public URL where the invoice lives
  return `/api/invoice/${subId}`;
};

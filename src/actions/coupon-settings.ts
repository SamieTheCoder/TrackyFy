"use server";

import { createClient } from "@/utils/supabase/server";
import { ICouponSettings } from "@/interfaces";

export async function getCouponSettings() {
  try {
    const supabase = await createClient(); // Add await here
    
    const { data, error } = await supabase
      .from("coupon_settings")
      .select("*")
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as ICouponSettings,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateCouponSettings(settings: Partial<ICouponSettings>) {
  try {
    const supabase = await createClient(); // Add await here
    
    const { data, error } = await supabase
      .from("coupon_settings")
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as ICouponSettings,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

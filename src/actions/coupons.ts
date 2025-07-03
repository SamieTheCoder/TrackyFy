"use server";

import { createClient } from "@/utils/supabase/server";
import { ICoupon, ICouponValidation } from "@/interfaces";

export async function getAllCoupons() {
  try {
    const supabase = await createClient(); // Add await here
    
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data as ICoupon[],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function createCoupon(couponData: Partial<ICoupon>) {
  try {
    const supabase = await createClient(); // Add await here
    
    const { data, error } = await supabase
      .from("coupons")
      .insert([couponData])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as ICoupon,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function updateCoupon(id: number, couponData: Partial<ICoupon>) {
  try {
    const supabase = await createClient(); // Add await here
    
    const { data, error } = await supabase
      .from("coupons")
      .update({ ...couponData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as ICoupon,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function deleteCoupon(id: number) {
  try {
    const supabase = await createClient(); // Add await here
    
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function validateCoupon(
  code: string, 
  amount: number, 
  planId: number
): Promise<ICouponValidation> {
  try {
    const supabase = await createClient(); // Add await here
    
    // Check if coupons are enabled
    const { data: settings } = await supabase
      .from("coupon_settings")
      .select("is_enabled")
      .single();

    if (!settings?.is_enabled) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Coupons are currently disabled",
      };
    }

    // Get coupon details
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Invalid coupon code",
      };
    }

    const now = new Date();
    
    // Check validity dates
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Coupon is not yet active",
      };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Coupon has expired",
      };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: "Coupon usage limit reached",
      };
    }

    // Check minimum amount
    if (coupon.min_amount && amount < coupon.min_amount) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: `Minimum order amount ₹${coupon.min_amount} required`,
      };
    }

    // Check applicable plans
    if (coupon.applicable_plans && coupon.applicable_plans.length > 0) {
      if (!coupon.applicable_plans.includes(planId)) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: amount,
          message: "Coupon not applicable for this plan",
        };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (amount * coupon.discount_value) / 100;
      if (coupon.max_discount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount);
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, amount);
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      isValid: true,
      coupon: coupon as ICoupon,
      discountAmount,
      finalAmount,
      message: `Coupon applied! You saved ₹${discountAmount}`,
    };
  } catch (error: any) {
    return {
      isValid: false,
      discountAmount: 0,
      finalAmount: amount,
      message: "Error validating coupon",
    };
  }
}

export async function applyCoupon(couponId: number) {
  try {
    const supabase = await createClient(); // Add await here
    
    // Fixed: Use rpc function for incrementing used_count
    const { data, error } = await supabase
      .rpc('increment_coupon_usage', { coupon_id: couponId });

    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", couponId)
        .single();

      if (fallbackError) throw fallbackError;

      const { data: updateData, error: updateError } = await supabase
        .from("coupons")
        .update({ used_count: fallbackData.used_count + 1 })
        .eq("id", couponId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        data: updateData as ICoupon,
      };
    }

    return {
      success: true,
      data: data as ICoupon,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

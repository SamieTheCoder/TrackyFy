"use server";

import supabase from "@/config/supabase-config";

export interface ICashPaymentRequest {
  user_id: number;
  plan_id: number;
  amount: number;
  original_amount?: number;
  discount_amount?: number;
  coupon_id?: number;
  start_date: string;
  end_date: string;
  total_duration: number;
  user_name: string;
  plan_name: string;
}

export const createCashPaymentRequest = async (payload: ICashPaymentRequest) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([{
        user_id: payload.user_id,
        plan_id: payload.plan_id,
        start_date: payload.start_date,
        end_date: payload.end_date,
        total_duration: payload.total_duration,
        amount: payload.amount,
        original_amount: payload.original_amount || payload.amount,
        discount_amount: payload.discount_amount || 0,
        coupon_id: payload.coupon_id || null,
        payment_id: `CASH_${Date.now()}`,
        is_active: false, // Will be activated after admin approval
        is_cash_approval: false, // Pending approval
      }]);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data,
      message: "Cash payment request submitted successfully. Awaiting admin approval."
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllPendingCashPayments = async () => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *, 
        plans(name), 
        user_profiles(name, email),
        coupons(code, name, discount_type, discount_value)
      `)
      .eq("is_cash_approval", false)
      .eq("is_active", false)
      .like("payment_id", "CASH_%")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const formattedData = data.map((item: any) => ({
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

export const approveCashPayment = async (subscriptionId: number) => {
  try {
    // Get subscription details first to check for coupon
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("user_id, coupon_id")
      .eq("id", subscriptionId)
      .single();

    if (fetchError) throw fetchError;

    // Update subscription status
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        is_cash_approval: true,
        is_active: true,
      })
      .eq("id", subscriptionId)
      .select("user_id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Mark user as customer
    await supabase.from("user_profiles").upsert({
      id: data.user_id,
      is_customer: true,
    });

    // If coupon was used, increment its usage count (FIXED: Removed .sql usage)
    if (subscription.coupon_id) {
      // Get current usage count
      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", subscription.coupon_id)
        .single();

      if (!couponError && couponData) {
        // Increment usage count
        await supabase
          .from("coupons")
          .update({ 
            used_count: couponData.used_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", subscription.coupon_id);
      }
    }

    return {
      success: true,
      message: "Cash payment approved successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const rejectCashPayment = async (subscriptionId: number) => {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Cash payment request rejected and removed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

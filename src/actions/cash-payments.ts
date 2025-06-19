"use server";

import supabase from "@/config/supabase-config";

export interface ICashPaymentRequest {
  user_id: number;
  plan_id: number;
  amount: number;
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
      .select("* , plans(name) , user_profiles(name, email)")
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

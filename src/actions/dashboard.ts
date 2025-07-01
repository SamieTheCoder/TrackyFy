"use server";

import supabase from "@/config/supabase-config";

export const getUsersReport = async () => {
  try {
    const { data, error } = await supabase.rpc("users_reports");

    if (error) {
      console.error("Users report error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      data: data[0],
    };
  } catch (error: any) {
    console.error("Users report exception:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getSubscriptionsReport = async () => {
  try {
    const { data, error } = await supabase.rpc("subscriptions_reports");

    if (error) {
      console.error("Subscriptions report error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      data: data[0] || { subscriptions_count: 0, total_revenue: 0 },
    };
  } catch (error: any) {
    console.error("Subscriptions report exception:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getMonthlyRevenueReport = async () => {
  try {
    const { data, error } = await supabase.rpc("monthly_revenue_report");

    if (error) {
      console.error("Monthly revenue report error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Monthly revenue report exception:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// New functions for subscription expiry tracking
export const getExpiringSubscriptions = async () => {
  try {
    const { data, error } = await supabase.rpc("get_expiring_subscriptions");

    if (error) {
      console.error("Expiring subscriptions error:", error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Expiring subscriptions exception:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

export const getExpiredSubscriptions = async () => {
  try {
    const { data, error } = await supabase.rpc("get_expired_subscriptions");

    if (error) {
      console.error("Expired subscriptions error:", error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Expired subscriptions exception:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

export const getSubscriptionExpiryStats = async () => {
  try {
    const { data, error } = await supabase.rpc("get_subscription_expiry_stats");

    if (error) {
      console.error("Subscription expiry stats error:", error);
      return {
        success: false,
        message: error.message,
        data: {
          expiring_today: 0,
          expiring_this_week: 0,
          expired_this_week: 0,
          expiring_next_week: 0,
        },
      };
    }

    return {
      success: true,
      data: data[0] || {
        expiring_today: 0,
        expiring_this_week: 0,
        expired_this_week: 0,
        expiring_next_week: 0,
      },
    };
  } catch (error: any) {
    console.error("Subscription expiry stats exception:", error);
    return {
      success: false,
      message: error.message,
      data: {
        expiring_today: 0,
        expiring_this_week: 0,
        expired_this_week: 0,
        expiring_next_week: 0,
      },
    };
  }
};

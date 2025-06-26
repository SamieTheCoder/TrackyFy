"use server";

import supabase from "@/config/supabase-config";

export interface IPaymentSettings {
  id?: number;
  gateway_name: string;
  is_enabled: boolean;
  is_primary: boolean;
  settings: {
    key_id?: string;
    key_secret?: string;
    publishable_key?: string;
    secret_key?: string;
  };
}

export const getPaymentSettings = async () => {
  try {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

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

export const updatePaymentSettings = async (
  gatewayName: string,
  settings: Partial<IPaymentSettings>
) => {
  try {
    // If setting as primary, first disable all other primary gateways
    if (settings.is_primary) {
      await supabase
        .from("payment_settings")
        .update({ is_primary: false })
        .neq("gateway_name", gatewayName);
    }

    const { data, error } = await supabase
      .from("payment_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("gateway_name", gatewayName)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

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

export const getEnabledPaymentGateways = async () => {
  try {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("is_enabled", true)
      .order("is_primary", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

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

export const getPrimaryPaymentGateway = async () => {
  try {
    const { data, error } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("is_primary", true)
      .eq("is_enabled", true)
      .single();

    if (error) {
      throw new Error(error.message);
    }

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

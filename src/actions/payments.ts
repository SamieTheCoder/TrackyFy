"use server";

import Razorpay from "razorpay";
import Stripe from "stripe";
import { getPaymentSettings } from "./payment-settings";

// Helper function to normalize amounts to avoid floating point issues
const normalizeAmount = (amount: number): number => {
  // Ensure the amount is properly rounded to avoid floating point issues
  return Math.round(amount);
};

// Razorpay functions
export const createRazorpayOrder = async (amountInPaise: number) => {
  try {
    // Ensure amount is an integer
    const normalizedAmount = normalizeAmount(amountInPaise);
    
    console.log("Creating Razorpay order with amount (paise):", normalizedAmount);

    const settingsResponse = await getPaymentSettings();
    if (!settingsResponse.success || !settingsResponse.data) {
      throw new Error("Failed to get payment settings");
    }

    const razorpaySettings = settingsResponse.data.find(
      (setting: any) => setting.gateway_name === "razorpay" && setting.is_enabled
    );

    if (!razorpaySettings) {
      throw new Error("Razorpay is not enabled");
    }

    const razorpay = new Razorpay({
      key_id: razorpaySettings.settings.key_id || process.env.RAZORPAY_KEY_ID!,
      key_secret: razorpaySettings.settings.key_secret || process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: normalizedAmount, // amount already in paise and normalized
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        order_type: "subscription",
        environment: "production"
      }
    };

    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      data: {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  try {
    const settingsResponse = await getPaymentSettings();
    if (!settingsResponse.success || !settingsResponse.data) {
      throw new Error("Failed to get payment settings");
    }

    const razorpaySettings = settingsResponse.data.find(
      (setting: any) => setting.gateway_name === "razorpay"
    );

    const keySecret = razorpaySettings?.settings?.key_secret || process.env.RAZORPAY_KEY_SECRET!;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      return {
        success: true,
        payment_id: razorpay_payment_id,
      };
    } else {
      return {
        success: false,
        message: "Payment verification failed",
      };
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Stripe functions
export const createStripePaymentIntent = async (amountInCents: number) => {
  try {
    // Ensure amount is an integer
    const normalizedAmount = normalizeAmount(amountInCents);
    
    console.log("Creating Stripe payment intent with amount (cents):", normalizedAmount);

    const settingsResponse = await getPaymentSettings();
    if (!settingsResponse.success || !settingsResponse.data) {
      throw new Error("Failed to get payment settings");
    }

    const stripeSettings = settingsResponse.data.find(
      (setting: any) => setting.gateway_name === "stripe" && setting.is_enabled
    );

    if (!stripeSettings) {
      throw new Error("Stripe is not enabled");
    }

    // Fix: Use type assertion to avoid version conflicts
    const stripe = new Stripe(
      stripeSettings.settings.secret_key || process.env.STRIPE_SECRET_KEY!,
      { apiVersion: "2023-10-16" as any }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizedAmount, // amount already in cents and normalized
      currency: "inr",
      description: "Payment for your order",
    });

    return {
      success: true,
      data: paymentIntent.client_secret,
    };
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";
import {
  IPlansGlobalStore,
  plansGlobalStore,
} from "@/global-store/plans-store";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { ArrowRight, Calendar, CreditCard, Package, Tag, Lock, Shield, Banknote } from "lucide-react";
import { getStripePaymentIntent } from "@/actions/payments";
import toast from "react-hot-toast";

//stripe ui
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./_components/checkout-form";
import userGlobalStore, { IUsersGlobalStore } from "@/global-store/users-store";
import { createNewSubscription } from "@/actions/subscriptions";
import { useRouter } from "next/navigation";
import CashPaymentForm from "@/components/cash-payment-form";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutPage() {
  const { selectedPaymentPlan } = plansGlobalStore() as IPlansGlobalStore;
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = userGlobalStore() as IUsersGlobalStore;
  const router = useRouter();

  //stripe ui
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showCashForm, setShowCashForm] = useState(false);

  const endDate = useMemo(() => {
    return dayjs(startDate)
      .add(selectedPaymentPlan?.paymentPlan?.duration || 0, "day")
      .format("YYYY-MM-DD");
  }, [startDate, selectedPaymentPlan]);

  const paymentIntentHandler = async () => {
    try {
      setIsProcessing(true);
      console.log(
        "Creating payment intent for plan:",
        selectedPaymentPlan?.paymentPlan?.planName
      );
      const response = await getStripePaymentIntent(
        selectedPaymentPlan?.paymentPlan?.price || 0
      );

      if (response.success) {
        console.log("Payment intent created:", response);
        setClientSecret(response.data);
        setShowCheckoutForm(true);
      } else {
        console.error("Payment intent creation failed:", response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      toast.error("Payment failed..");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = () => {
    setShowCashForm(true);
  };

  const options = {
    //passing the client secret to the stripe component
    clientSecret: clientSecret!,
  };
  
  // stripe payment
  const onPaymentSuccess = async (paymentId: string) => {
    try {
      const payload = {
        user_id: user?.id,
        plan_id: selectedPaymentPlan?.mainPlan.id,
        start_date: startDate,
        end_date: endDate,
        payment_id: paymentId,
        amount: Number(selectedPaymentPlan?.paymentPlan.price),
        total_duration: Number(selectedPaymentPlan?.paymentPlan?.duration),
        is_active: true,
      };

      console.log("Creating subscription with payload:", payload);
      const response = await createNewSubscription(payload);
      console.log("Subscription creation response:", response);

      if (response.success) {
        toast.success(
          "Congratulations! Your payment was successful, Your subscription has been activated."
        );
        router.push("/account/user/subscriptions");
      } else {
        console.error("Subscription creation failed:", response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Payment failed.....");
    }
  };

  if (!selectedPaymentPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <PageTitle title="Checkout" />
        <div className="mt-8 p-8 text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            No Plan Selected
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't selected a plan yet. Please go back to the plans page
            and choose a plan.
          </p>
          <Button 
            asChild
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <a href="/account/user/purchase-plan">Browse Plans</a>
          </Button>
        </div>
      </div>
    );
  }

  // Determine color scheme based on plan name
  const getPlanColorScheme = () => {
    const name = selectedPaymentPlan.mainPlan?.name.toLowerCase() || '';
    
    if (name.includes('basic')) {
      return {
        gradient: "from-[#FF6B6B] to-[#FF8E8E]",
        bg: "bg-[#FFF0F0]",
        border: "border-[#FF6B6B]",
        text: "text-[#FF6B6B]"
      };
    } else if (name.includes('standard')) {
      return {
        gradient: "from-[#FF8008] to-[#FFA794]",
        bg: "bg-[#FFF6F0]",
        border: "border-[#FF8008]",
        text: "text-[#FF8008]"
      };
    } else if (name.includes('premium')) {
      return {
        gradient: "from-[#FF512F] to-[#DD2476]",
        bg: "bg-[#FFF0F6]",
        border: "border-[#DD2476]",
        text: "text-[#DD2476]"
      };
    } else {
      return {
        gradient: "from-[#FF9966] to-[#FF5E62]",
        bg: "bg-[#FFF0F0]",
        border: "border-[#FF5E62]",
        text: "text-[#FF5E62]"
      };
    }
  };

  const colorScheme = getPlanColorScheme();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <PageTitle title="Complete Your Purchase" />

      <div className="mt-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${colorScheme.gradient} text-white`}>
            <h2 className="text-lg font-semibold mb-1">
              Order Summary
            </h2>
            <p className="text-sm text-white/80">
              Review your subscription details
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 ${colorScheme.bg} rounded-full flex items-center justify-center mr-4`}>
                <Package className={`h-6 w-6 ${colorScheme.text}`} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedPaymentPlan.mainPlan?.name}
                </h3>
                <p className={`text-sm ${colorScheme.text}`}>
                  {selectedPaymentPlan.paymentPlan?.planName} Plan
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-700">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>Subscription Price</span>
                </div>
                <span className="font-medium text-gray-900">
                  ₹{selectedPaymentPlan.paymentPlan?.price}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Billing Period</span>
                </div>
                <span className="font-medium text-gray-900">
                  {selectedPaymentPlan.paymentPlan?.duration} days
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Start Date</span>
                </div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-40 text-right focus:ring-2 focus:ring-offset-0 focus:${colorScheme.text} focus:border-transparent`}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center text-gray-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  <span>End Date</span>
                </div>
                <span className="font-medium text-gray-900">{endDate}</span>
              </div>
            </div>

            <div className={`pt-4 border-t border-gray-100 ${colorScheme.bg} -mx-6 px-6 pb-6 mt-6 rounded-b-lg`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-700">Total Amount</span>
                <span className={`text-xl font-bold ${colorScheme.text}`}>
                  ₹{selectedPaymentPlan.paymentPlan?.price}
                </span>
              </div>

              {/* Payment Method Buttons */}
              <div className="space-y-3">
                <Button
                  className={`w-full h-11 text-base font-medium bg-gradient-to-r ${colorScheme.gradient} hover:opacity-90 text-white`}
                  onClick={paymentIntentHandler}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Card
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className={`w-full h-11 text-base font-medium border-2 ${colorScheme.border} ${colorScheme.text} hover:${colorScheme.bg}`}
                  onClick={handleCashPayment}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Request Cash Payment
                </Button>
              </div>

              {showCheckoutForm && clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm
                    showCheckoutForm={showCheckoutForm}
                    setShowCheckoutForm={setShowCheckoutForm}
                    onPaymentSuccess={onPaymentSuccess}
                  />
                </Elements>
              )}

              {/* Cash Payment Form */}
              <CashPaymentForm
                showCashForm={showCashForm}
                setShowCashForm={setShowCashForm}
                selectedPaymentPlan={selectedPaymentPlan}
                user={user}
                startDate={startDate}
                endDate={endDate}
              />
              
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Secure payment</span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-4">
                By proceeding with the payment, you agree to our terms and
                conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-900">Secure Transaction</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your payment information is processed securely. We do not store credit card details.
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-3">
              <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
            </div>
            <p className="text-sm text-gray-600">
              We accept all major credit cards, debit cards, and cash payments with admin approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

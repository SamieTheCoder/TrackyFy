"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";
import {
  IPlansGlobalStore,
  plansGlobalStore,
} from "@/global-store/plans-store";
import dayjs from "dayjs";
import React, { useMemo, useState, useEffect } from "react";
import { ArrowRight, Calendar, CreditCard, Package, Tag, Lock, Shield, Banknote, Sparkles, CheckCircle } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment, createStripePaymentIntent } from "@/actions/payments";
import { getEnabledPaymentGateways } from "@/actions/payment-settings";
import toast from "react-hot-toast";
import userGlobalStore, { IUsersGlobalStore } from "@/global-store/users-store";
import { createNewSubscription } from "@/actions/subscriptions";
import { useRouter } from "next/navigation";
import CashPaymentForm from "@/components/cash-payment-form";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./_components/checkout-form";

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutPage() {
  const { selectedPaymentPlan } = plansGlobalStore() as IPlansGlobalStore;
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = userGlobalStore() as IUsersGlobalStore;
  const router = useRouter();

  // Payment gateway states
  const [enabledGateways, setEnabledGateways] = useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  
  // Razorpay states
  const [orderData, setOrderData] = React.useState<{
    order_id: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Stripe states
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Cash payment state
  const [showCashForm, setShowCashForm] = useState(false);

  // Load enabled payment gateways
  useEffect(() => {
    const fetchEnabledGateways = async () => {
      try {
        const response = await getEnabledPaymentGateways();
        if (response.success && response.data) {
          setEnabledGateways(response.data);
          const primaryGateway = response.data.find((gateway: any) => gateway.is_primary);
          if (primaryGateway) {
            setSelectedGateway(primaryGateway.gateway_name);
          } else if (response.data.length > 0) {
            setSelectedGateway(response.data[0].gateway_name);
          }
        }
      } catch (error) {
        console.error("Error fetching payment gateways:", error);
      }
    };

    fetchEnabledGateways();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          toast.error("Failed to load Razorpay SDK");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    if (enabledGateways.some(gateway => gateway.gateway_name === 'razorpay') && !window.Razorpay) {
      loadRazorpayScript();
    } else if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, [enabledGateways]);

  const endDate = useMemo(() => {
    return dayjs(startDate)
      .add(selectedPaymentPlan?.paymentPlan?.duration || 0, "day")
      .format("YYYY-MM-DD");
  }, [startDate, selectedPaymentPlan]);

  const handlePayment = async () => {
    if (selectedGateway === 'razorpay') {
      await handleRazorpayPayment();
    } else if (selectedGateway === 'stripe') {
      await handleStripePayment();
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      
      if (!razorpayLoaded) {
        toast.error("Payment system is loading. Please try again.");
        return;
      }

      const response = await createRazorpayOrder(
        selectedPaymentPlan?.paymentPlan?.price || 0
      );

      if (response.success && response.data) {
        const orderInfo = {
          order_id: response.data.order_id,
          amount: typeof response.data.amount === 'string' 
            ? parseInt(response.data.amount) 
            : response.data.amount,
          currency: response.data.currency,
        };
        
        setOrderData(orderInfo);
        openRazorpayCheckout(orderInfo);
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      
      const response = await createStripePaymentIntent(
        selectedPaymentPlan?.paymentPlan?.price || 0
      );

      if (response.success && response.data) {
        setClientSecret(response.data);
        setShowCheckoutForm(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Payment intent error:", error);
      toast.error("Payment failed..");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRazorpayCheckout = (orderInfo: { order_id: string; amount: number; currency: string }) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderInfo.amount,
      currency: orderInfo.currency,
      name: "TrackyFy",
      description: "Subscription Payment",
      order_id: orderInfo.order_id,
      handler: async function (response: any) {
        console.log("Payment response:", response);
        
        const verificationResult = await verifyRazorpayPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verificationResult.success) {
          await onPaymentSuccess(response.razorpay_payment_id, 'razorpay');
        } else {
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        // contact: user?.phone || "",
      },
      theme: {
        color: "#3B82F6",
      },
      config: {
        display: {
          blocks: {
            utib: {
              name: 'Pay using UPI',
              instruments: [{ method: 'upi' }]
            },
            other: {
              name: 'Other Payment Methods',
              instruments: [
                { method: 'card' },
                { method: 'netbanking' },
                { method: 'wallet' }
              ]
            }
          },
          sequence: ['block.utib', 'block.other'],
          preferences: {
            show_default_blocks: true,
          }
        }
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal closed");
          setIsProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      toast.error(`Payment failed: ${response.error.description}`);
      setIsProcessing(false);
    });

    rzp.open();
  };

  const handleCashPayment = () => {
    setShowCashForm(true);
  };

  const onPaymentSuccess = async (paymentId: string, gateway: string) => {
    try {
      const payload = {
        user_id: user?.id,
        plan_id: selectedPaymentPlan?.mainPlan.id,
        start_date: startDate,
        end_date: endDate,
        payment_id: paymentId,
        payment_gateway: gateway,
        amount: Number(selectedPaymentPlan?.paymentPlan.price),
        total_duration: Number(selectedPaymentPlan?.paymentPlan?.duration),
        is_active: true,
      };

      const response = await createNewSubscription(payload);

      if (response.success) {
        toast.success(
          "Congratulations! Your payment was successful. Your subscription has been activated."
        );
        router.push("/account/user/subscriptions");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Payment successful but subscription activation failed");
    }
  };

  if (!selectedPaymentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <PageTitle title="Checkout" />
          <div className="mt-12 p-12 text-center bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Plan Selected
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't selected a plan yet. Please go back to the plans page
              and choose the perfect plan for your needs.
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <a href="/account/user/purchase-plan">
                <Sparkles className="h-5 w-5 mr-2" />
                Browse Plans
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getPlanColorScheme = () => {
    const name = selectedPaymentPlan.mainPlan?.name.toLowerCase() || '';
    
    if (name.includes('basic')) {
      return {
        gradient: "from-blue-500 to-blue-600",
        lightGradient: "from-blue-50 to-blue-100",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        accent: "bg-blue-500"
      };
    } else if (name.includes('standard')) {
      return {
        gradient: "from-purple-500 to-purple-600",
        lightGradient: "from-purple-50 to-purple-100",
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600",
        accent: "bg-purple-500"
      };
    } else if (name.includes('premium')) {
      return {
        gradient: "from-orange-500 to-red-500",
        lightGradient: "from-orange-50 to-red-50",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        accent: "bg-orange-500"
      };
    } else {
      return {
        gradient: "from-indigo-500 to-purple-600",
        lightGradient: "from-indigo-50 to-purple-50",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-600",
        accent: "bg-indigo-500"
      };
    }
  };

  const colorScheme = getPlanColorScheme();

  const stripeOptions = clientSecret ? {
    clientSecret: clientSecret,
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <PageTitle title="Complete Your Purchase" />
          <p className="text-gray-600 mt-2 text-lg">
            You're just one step away from unlocking premium features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className={`p-8 bg-gradient-to-r ${colorScheme.gradient} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">
                    Order Summary
                  </h2>
                  <p className="text-white/80">
                    Review your subscription details
                  </p>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-8">
                <div className="flex items-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${colorScheme.lightGradient} rounded-2xl flex items-center justify-center mr-6 shadow-lg`}>
                    <Package className={`h-8 w-8 ${colorScheme.text}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedPaymentPlan.mainPlan?.name}
                    </h3>
                    <p className={`text-sm ${colorScheme.text} font-medium`}>
                      {selectedPaymentPlan.paymentPlan?.planName} Plan
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <Tag className="h-5 w-5 mr-3 text-gray-500" />
                      <span className="font-medium">Subscription Price</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{selectedPaymentPlan.paymentPlan?.price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                      <span className="font-medium">Billing Period</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {selectedPaymentPlan.paymentPlan?.duration} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                      <span className="font-medium">Start Date</span>
                    </div>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-44 text-right border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-700">
                      <ArrowRight className="h-5 w-5 mr-3 text-gray-500" />
                      <span className="font-medium">End Date</span>
                    </div>
                    <span className="font-semibold text-gray-900">{endDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              {/* Payment Header */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className={`text-3xl font-bold bg-gradient-to-r ${colorScheme.gradient} bg-clip-text text-transparent`}>
                    ₹{selectedPaymentPlan.paymentPlan?.price}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Selection */}
              {enabledGateways.length > 1 && (
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h4>
                  <div className="space-y-2">
                    {enabledGateways.map((gateway) => (
                      <label key={gateway.gateway_name} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment-gateway"
                          value={gateway.gateway_name}
                          checked={selectedGateway === gateway.gateway_name}
                          onChange={(e) => setSelectedGateway(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <CreditCard className={`h-5 w-5 mr-2 ${
                            gateway.gateway_name === 'razorpay' ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                          <span className="font-medium capitalize">{gateway.gateway_name}</span>
                          {gateway.is_primary && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="p-6 space-y-4">
                <Button
                  className={`w-full h-14 text-base font-semibold bg-gradient-to-r ${colorScheme.gradient} hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedGateway || (selectedGateway === 'razorpay' && !razorpayLoaded)}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing...
                    </>
                  ) : selectedGateway === 'razorpay' && !razorpayLoaded ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Loading Payment Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-3" />
                      Pay with {selectedGateway === 'razorpay' ? 'Razorpay' : 'Stripe'}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className={`w-full h-12 text-base font-medium border-2 ${colorScheme.border} ${colorScheme.text} hover:bg-gradient-to-r hover:${colorScheme.lightGradient} rounded-xl transition-all duration-300`}
                  onClick={handleCashPayment}
                >
                  <Banknote className="h-5 w-5 mr-3" />
                  Request Cash Payment
                </Button>

                {/* Payment Methods Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Accepted Payment Methods</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {selectedGateway === 'razorpay' && (
                      <>
                        <div>• UPI (Google Pay, PhonePe, Paytm)</div>
                        <div>• Credit & Debit Cards</div>
                        <div>• Net Banking</div>
                        <div>• Digital Wallets</div>
                      </>
                    )}
                    {selectedGateway === 'stripe' && (
                      <>
                        <div>• Credit & Debit Cards</div>
                        <div>• International Cards</div>
                        <div>• Apple Pay & Google Pay</div>
                      </>
                    )}
                    <div>• Cash Payment (Admin Approval)</div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="flex items-center justify-center pt-4 border-t border-gray-100">
                  <Lock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs text-gray-500">256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Checkout Form - PROPERLY WRAPPED */}
        {showCheckoutForm && clientSecret && selectedGateway === 'stripe' && stripeOptions && (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <CheckoutForm
              showCheckoutForm={showCheckoutForm}
              setShowCheckoutForm={setShowCheckoutForm}
              onPaymentSuccess={(paymentId) => onPaymentSuccess(paymentId, 'stripe')}
              orderData={undefined} // Pass undefined instead of null for Stripe
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

        {/* Security & Trust Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="font-bold text-gray-900">Secure Transaction</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your payment information is processed securely through our trusted payment partners with industry-standard encryption.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="font-bold text-gray-900">Multiple Payment Options</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Choose from multiple payment gateways and methods including UPI, cards, net banking, wallets, and cash payments.
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            By proceeding with the payment, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            Your subscription will be activated immediately after successful payment.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Banknote, Calendar, Package, Tag, User } from "lucide-react";
import toast from "react-hot-toast";
import { createCashPaymentRequest } from "@/actions/cash-payments";
import { useRouter } from "next/navigation";
import { ICouponValidation } from "@/interfaces";

interface ICashPaymentFormProps {
  showCashForm: boolean;
  setShowCashForm: (value: boolean) => void;
  selectedPaymentPlan: any;
  user: any;
  startDate: string;
  endDate: string;
  appliedCouponValidation?: ICouponValidation;
  finalAmount: number;
}

function CashPaymentForm({
  showCashForm,
  setShowCashForm,
  selectedPaymentPlan,
  user,
  startDate,
  endDate,
  appliedCouponValidation,
  finalAmount,
}: ICashPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCashPayment = async () => {
    try {
      setIsProcessing(true);

      const payload = {
        user_id: user?.id,
        plan_id: selectedPaymentPlan?.mainPlan.id,
        amount: finalAmount,
        original_amount: selectedPaymentPlan?.paymentPlan.price,
        discount_amount: appliedCouponValidation?.discountAmount ?? 0,
        /* OPTION A – never null: */
        coupon_id: appliedCouponValidation?.coupon?.id ?? undefined,
        /* OPTION B – keep null:
     coupon_id: appliedCouponValidation?.coupon?.id ?? null,
  */
        start_date: startDate,
        end_date: endDate,
        total_duration: Number(selectedPaymentPlan?.paymentPlan?.duration),
        user_name: user?.name || user?.email,
        plan_name: selectedPaymentPlan?.mainPlan?.name,
      };

      const response = await createCashPaymentRequest(payload);

      if (response.success) {
        toast.success(response.message);
        setShowCashForm(false);
        router.push("/account/user/subscriptions");
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit cash payment request");
    } finally {
      setIsProcessing(false);
    }
  };

  // Use the same color scheme as the Stripe CheckoutForm
  const colorScheme = {
    gradient: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <Dialog open={showCashForm} onOpenChange={setShowCashForm}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
        {/* Header */}
        <div
          className={`p-6 border-b border-gray-100 bg-gradient-to-r ${colorScheme.gradient} text-white rounded-t-xl`}
        >
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Banknote className="h-5 w-5 mr-2" />
            Cash Payment Request
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Submit request for manual payment approval
          </DialogDescription>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">Customer</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[140px] text-right">
                {user?.name || user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm">Plan</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[140px] text-right">
                {selectedPaymentPlan?.mainPlan?.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Tag className="h-4 w-4 mr-2" />
                <span className="text-sm">Duration</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm text-right">
                {selectedPaymentPlan?.paymentPlan?.planName}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">Period</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white text-sm text-right">
                {startDate} to {endDate}
              </span>
            </div>

            {/* Show discount information if coupon was applied */}
            {appliedCouponValidation && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="text-sm">Original Price</span>
                  </div>
                  <span className="font-medium text-gray-500 dark:text-gray-400 text-sm text-right line-through">
                    ₹{selectedPaymentPlan?.paymentPlan?.price}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-green-700 dark:text-green-300">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="text-sm">Discount</span>
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400 text-sm text-right">
                    -₹{appliedCouponValidation.discountAmount}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Amount Card */}
          <div
            className={`pt-4 border-t border-gray-100 ${colorScheme.bg} -mx-6 px-6 pb-4 rounded-b-lg`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Total Amount
              </span>
              <span className={`text-xl font-bold ${colorScheme.text}`}>
                ₹{finalAmount}
              </span>
            </div>
            {appliedCouponValidation && (
              <div className="text-xs text-green-600 dark:text-green-400 text-right">
                You saved ₹{appliedCouponValidation.discountAmount}!
              </div>
            )}
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your request will be sent to admin for
              approval. You will be notified once the payment is processed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
              onClick={() => setShowCashForm(false)}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 bg-gradient-to-r ${colorScheme.gradient} hover:opacity-90 text-white font-semibold`}
              onClick={handleCashPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>Submit Request</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CashPaymentForm;

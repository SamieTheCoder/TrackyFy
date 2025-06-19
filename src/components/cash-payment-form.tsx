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
import { Input } from "@/components/ui/input";
import { Banknote, Calendar, Package, Tag, User } from "lucide-react";
import toast from "react-hot-toast";
import { createCashPaymentRequest } from "@/actions/cash-payments";
import { useRouter } from "next/navigation";

interface ICashPaymentFormProps {
  showCashForm: boolean;
  setShowCashForm: (value: boolean) => void;
  selectedPaymentPlan: any;
  user: any;
  startDate: string;
  endDate: string;
}

function CashPaymentForm({
  showCashForm,
  setShowCashForm,
  selectedPaymentPlan,
  user,
  startDate,
  endDate,
}: ICashPaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCashPayment = async () => {
    try {
      setIsProcessing(true);

      const payload = {
        user_id: user?.id,
        plan_id: selectedPaymentPlan?.mainPlan.id,
        amount: Number(selectedPaymentPlan?.paymentPlan.price),
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

  // Color scheme function
  const getPlanColorScheme = () => {
    const name = selectedPaymentPlan?.mainPlan?.name.toLowerCase() || '';
    
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
    <Dialog open={showCashForm} onOpenChange={setShowCashForm}>
      <DialogContent className="max-w-md">
        <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${colorScheme.gradient} text-white rounded-t-lg`}>
          <DialogTitle className="text-lg font-semibold mb-1 flex items-center">
            <Banknote className="h-5 w-5 mr-2" />
            Cash Payment Request
          </DialogTitle>
          <DialogDescription className="text-white/80 text-sm">
            Submit request for manual payment approval
          </DialogDescription>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">Customer</span>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {user?.name || user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm">Plan</span>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {selectedPaymentPlan?.mainPlan?.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700">
                <Tag className="h-4 w-4 mr-2" />
                <span className="text-sm">Duration</span>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {selectedPaymentPlan?.paymentPlan?.planName}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">Period</span>
              </div>
              <span className="font-medium text-gray-900 text-sm">
                {startDate} to {endDate}
              </span>
            </div>

            <div className={`pt-4 border-t border-gray-100 ${colorScheme.bg} -mx-6 px-6 pb-4 rounded-b-lg`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-700">Total Amount</span>
                <span className={`text-xl font-bold ${colorScheme.text}`}>
                  ₹{selectedPaymentPlan?.paymentPlan?.price}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your request will be sent to admin for approval. 
              You will be notified once the payment is processed.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
              onClick={() => setShowCashForm(false)}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 bg-gradient-to-r ${colorScheme.gradient} hover:opacity-90 text-white`}
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

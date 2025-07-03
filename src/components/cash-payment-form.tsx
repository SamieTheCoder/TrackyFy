"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCashPaymentRequest } from "@/actions/cash-payments";
import toast from "react-hot-toast";
import { Banknote, AlertCircle, CheckCircle, Tag, IndianRupee } from "lucide-react";
import { ICouponValidation } from "@/interfaces";
import { useRouter } from "next/navigation"; // Add this import

interface CashPaymentFormProps {
  showCashForm: boolean;
  setShowCashForm: (show: boolean) => void;
  selectedPaymentPlan: any;
  user: any;
  startDate: string;
  endDate: string;
  appliedCouponValidation?: ICouponValidation;
  finalAmount?: number;
}

export default function CashPaymentForm({
  showCashForm,
  setShowCashForm,
  selectedPaymentPlan,
  user,
  startDate,
  endDate,
  appliedCouponValidation,
  finalAmount,
}: CashPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter(); // Add this line

  // Use finalAmount if provided, otherwise use original price
  const paymentAmount = finalAmount || selectedPaymentPlan?.paymentPlan?.price || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const payload = {
        user_id: user?.id,
        plan_id: selectedPaymentPlan?.mainPlan.id,
        start_date: startDate,
        end_date: endDate,
        total_duration: Number(selectedPaymentPlan?.paymentPlan?.duration),
        amount: paymentAmount, // Use final amount after discount
        original_amount: selectedPaymentPlan?.paymentPlan?.price, // Store original amount
        discount_amount: appliedCouponValidation?.discountAmount || 0,
        coupon_id: appliedCouponValidation?.coupon?.id ?? undefined, // Fix TypeScript issue
        user_name: user?.name || "",
        plan_name: selectedPaymentPlan?.mainPlan?.name || "",
      };

      const response = await createCashPaymentRequest(payload);

      if (response.success) {
        toast.success(response.message);
        setShowCashForm(false);
        setNotes("");
        // Add redirect to subscriptions page
        router.push("/account/user/subscriptions");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to submit cash payment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPaymentPlan) return null;

  return (
    <Dialog open={showCashForm} onOpenChange={setShowCashForm}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-600">
            <Banknote className="h-5 w-5 mr-2" />
            Cash Payment Request
          </DialogTitle>
          <DialogDescription>
            Submit a request for cash payment. This will be reviewed by our admin team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Payment Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium">{selectedPaymentPlan.mainPlan?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Billing:</span>
                <span className="font-medium">{selectedPaymentPlan.paymentPlan?.planName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium">{selectedPaymentPlan.paymentPlan?.duration} days</span>
              </div>

              {/* Show coupon information if applied */}
              {appliedCouponValidation && (
                <>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Original Price:</span>
                    <span className="font-medium line-through text-gray-500">
                      ₹{selectedPaymentPlan.paymentPlan?.price}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>Coupon ({appliedCouponValidation.coupon?.code}):</span>
                    </div>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -₹{appliedCouponValidation.discountAmount}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {appliedCouponValidation ? "Final Amount:" : "Total Amount:"}
                </span>
                <span className="font-bold text-orange-600 text-lg">
                  ₹{paymentAmount}
                </span>
              </div>
            </div>

            {appliedCouponValidation && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                <div className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    You're saving ₹{appliedCouponValidation.discountAmount} with this coupon!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information for the admin team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your request will be reviewed by our admin team</li>
                  <li>You'll receive confirmation once approved</li>
                  <li>Your subscription will be activated after payment verification</li>
                  {appliedCouponValidation && (
                    <li>The applied coupon discount will be honored upon approval</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCashForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

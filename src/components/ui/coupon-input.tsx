"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { validateCoupon } from "@/actions/coupons";
import { ICouponValidation } from "@/interfaces";
import toast from "react-hot-toast";

interface CouponInputProps {
  amount: number;
  planId: number;
  onCouponApplied: (validation: ICouponValidation) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: ICouponValidation;
}

export default function CouponInput({
  amount,
  planId,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    try {
      const validation = await validateCoupon(couponCode.trim(), amount, planId);
      
      if (validation.isValid) {
        onCouponApplied(validation);
        toast.success(validation.message);
        setCouponCode("");
      } else {
        toast.error(validation.message);
      }
    } catch (error) {
      toast.error("Error validating coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setCouponCode("");
    toast.success("Coupon removed");
  };

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="pl-10"
              onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
            />
          </div>
          <Button
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            variant="outline"
            className="px-6"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {appliedCoupon.coupon?.code}
              </span>
              <p className="text-xs text-green-600 dark:text-green-400">
                Saved ₹{appliedCoupon.discountAmount}
              </p>
            </div>
          </div>
          <Button
            onClick={handleRemoveCoupon}
            variant="ghost"
            size="sm"
            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

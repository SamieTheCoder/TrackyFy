"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Percent } from "lucide-react";
import CouponInput from "@/components/ui/coupon-input";
import { ICouponValidation } from "@/interfaces";

interface CouponSectionProps {
  amount: number;
  planId: number;
  appliedCoupon?: ICouponValidation;
  onCouponApplied: (validation: ICouponValidation) => void;
  onCouponRemoved: () => void;
}

export default function CouponSection({
  amount,
  planId,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
}: CouponSectionProps) {
  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Tag className="h-5 w-5 mr-2 text-orange-500" />
          Have a Coupon?
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your coupon code to get a discount on your subscription
        </p>
      </CardHeader>
      <CardContent>
        <CouponInput
          amount={amount}
          planId={planId}
          appliedCoupon={appliedCoupon}
          onCouponApplied={onCouponApplied}
          onCouponRemoved={onCouponRemoved}
        />
        
        {appliedCoupon && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Original Amount:</span>
              <span className="line-through">₹{amount}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
              <span>Discount:</span>
              <span>-₹{appliedCoupon.discountAmount}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <span>Final Amount:</span>
              <span className="text-green-600 dark:text-green-400">₹{appliedCoupon.finalAmount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

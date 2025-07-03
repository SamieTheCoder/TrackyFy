"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICoupon, IPlan } from "@/interfaces";
import { createCoupon, updateCoupon } from "@/actions/coupons";
import { getAllPlans } from "@/actions/plans";
import toast from "react-hot-toast";

interface CouponFormProps {
  coupon?: ICoupon | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CouponForm({ coupon, onSuccess, onCancel }: CouponFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    is_active: true,
    valid_from: "",
    valid_until: "",
    applicable_plans: [] as number[],
  });
  
  // Fixed: Properly typed plans state
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_amount: coupon.min_amount || 0,
        max_discount: coupon.max_discount || 0,
        usage_limit: coupon.usage_limit || 0,
        is_active: coupon.is_active,
        valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : "",
        valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : "",
        applicable_plans: coupon.applicable_plans || [],
      });
    }

    fetchPlans();
  }, [coupon]);

  const fetchPlans = async () => {
    try {
      const response = await getAllPlans();
      if (response.success && response.data) {
        // Fixed: Proper type checking
        setPlans(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    try {
      setSaving(true);
      
      // Fixed: Convert null to undefined for TypeScript compatibility
      const payload: Partial<ICoupon> = {
        ...formData,
        code: formData.code.toUpperCase(),
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : undefined,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : undefined,
        applicable_plans: formData.applicable_plans.length > 0 ? formData.applicable_plans : undefined,
      };

      const response = coupon
        ? await updateCoupon(coupon.id, payload)
        : await createCoupon(payload);

      if (response.success) {
        toast.success(`Coupon ${coupon ? "updated" : "created"} successfully`);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="20% Off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Get 20% off on all plans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: "percentage" | "fixed") =>
                  setFormData({ ...formData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-value">
                Discount Value ({formData.discount_type === "percentage" ? "%" : "₹"})
              </Label>
              <Input
                id="discount-value"
                type="number"
                min="0"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Minimum Amount (₹)</Label>
              <Input
                id="min-amount"
                type="number"
                min="0"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-discount">Max Discount (₹)</Label>
              <Input
                id="max-discount"
                type="number"
                min="0"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage-limit">Usage Limit</Label>
              <Input
                id="usage-limit"
                type="number"
                min="0"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid-from">Valid From</Label>
              <Input
                id="valid-from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid-until">Valid Until</Label>
              <Input
                id="valid-until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : coupon ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

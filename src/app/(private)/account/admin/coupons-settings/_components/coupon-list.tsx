"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { ICoupon } from "@/interfaces";
import { deleteCoupon, updateCoupon } from "@/actions/coupons";
import toast from "react-hot-toast";

interface CouponListProps {
  coupons: ICoupon[];
  onEdit: (coupon: ICoupon) => void;
  onUpdate: () => void;
  isEnabled: boolean;
}

export default function CouponList({ coupons, onEdit, onUpdate, isEnabled }: CouponListProps) {
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await deleteCoupon(id);
      if (response.success) {
        toast.success("Coupon deleted successfully");
        onUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleStatus = async (coupon: ICoupon) => {
    try {
      const response = await updateCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });
      
      if (response.success) {
        toast.success(`Coupon ${!coupon.is_active ? "activated" : "deactivated"}`);
        onUpdate();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied to clipboard");
  };

  if (!isEnabled) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Coupons are currently disabled. Enable them in settings to create and manage coupons.
        </p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No coupons created yet. Create your first coupon to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                    {coupon.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(coupon.code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{coupon.name || "-"}</TableCell>
              <TableCell>
                {coupon.discount_type === "percentage"
                  ? `${coupon.discount_value}%`
                  : `₹${coupon.discount_value}`}
              </TableCell>
              <TableCell>
                {coupon.used_count}
                {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / ∞"}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.is_active ? "default" : "secondary"}>
                  {coupon.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {coupon.valid_until
                  ? new Date(coupon.valid_until).toLocaleDateString()
                  : "No expiry"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(coupon)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(coupon)}
                  >
                    {coupon.is_active ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(coupon.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

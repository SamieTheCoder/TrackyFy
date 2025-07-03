"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ICouponSettings } from "@/interfaces";
import { updateCouponSettings } from "@/actions/coupon-settings";
import toast from "react-hot-toast";

interface SettingsToggleProps {
  settings: ICouponSettings;
  onUpdate: (settings: ICouponSettings) => void;
}

export default function SettingsToggle({ settings, onUpdate }: SettingsToggleProps) {
  const [formData, setFormData] = useState<ICouponSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateCouponSettings(formData);
      
      if (response.success && response.data) {
        // Fixed: Proper type checking
        onUpdate(response.data);
        toast.success("Settings updated successfully");
      } else {
        toast.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enabled">Enable Coupons</Label>
        <Switch
          id="enabled"
          checked={formData.is_enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_enabled: checked })
          }
        />
      </div>

      {formData.is_enabled && (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="stacking">Allow Stacking</Label>
            <Switch
              id="stacking"
              checked={formData.allow_stacking}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allow_stacking: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-discount">Max Discount Percentage</Label>
            <Input
              id="max-discount"
              type="number"
              min="0"
              max="100"
              value={formData.max_discount_percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_discount_percentage: Number(e.target.value),
                })
              }
            />
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

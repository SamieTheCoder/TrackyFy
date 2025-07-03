"use client";

import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, TicketPercent } from "lucide-react";
import { ICoupon, ICouponSettings } from "@/interfaces";
import { getAllCoupons } from "@/actions/coupons";
import { getCouponSettings } from "@/actions/coupon-settings";
import CouponForm from "./_components/coupon-form";
import CouponList from "./_components/coupon-list";
import SettingsToggle from "./_components/settings-toggle";
import toast from "react-hot-toast";

export default function CouponsSettingsPage() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [settings, setSettings] = useState<ICouponSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsResponse, settingsResponse] = await Promise.all([
        getAllCoupons(),
        getCouponSettings(),
      ]);

      // Fixed: Proper type checking and null safety
      if (couponsResponse.success && couponsResponse.data) {
        setCoupons(couponsResponse.data);
      }

      if (settingsResponse.success && settingsResponse.data) {
        setSettings(settingsResponse.data);
      }
    } catch (error) {
      toast.error("Failed to fetch coupon data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCoupon(null);
    fetchData();
  };

  const handleEdit = (coupon: ICoupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageTitle title="Coupons Settings" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 flex items-center justify-center">
            <TicketPercent className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <PageTitle title="Coupons Settings" />
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage discount coupons and settings
            </p>
          </div>
        </div>
        
        {settings?.is_enabled && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Coupon Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {settings && (
                <SettingsToggle
                  settings={settings}
                  onUpdate={(newSettings) => {
                    setSettings(newSettings);
                    fetchData();
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Coupons ({coupons.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <CouponList
                coupons={coupons}
                onEdit={handleEdit}
                onUpdate={fetchData}
                isEnabled={settings?.is_enabled || false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <CouponForm
          coupon={editingCoupon}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingCoupon(null);
          }}
        />
      )}
    </div>
  );
}

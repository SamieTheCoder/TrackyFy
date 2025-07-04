"use client";

import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  TicketPercent, 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  Package2, 
  Percent, 
  Users, 
  Calendar,
  Sparkles,
  Download,
  Filter
} from "lucide-react";
import { ICoupon, ICouponSettings } from "@/interfaces";
import { getAllCoupons } from "@/actions/coupons";
import { getCouponSettings } from "@/actions/coupon-settings";
import CouponForm from "./_components/coupon-form";
import CouponList from "./_components/coupon-list";
import SettingsToggle from "./_components/settings-toggle";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Enhanced statistics calculations
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.used_count, 0);
  const expiredCoupons = coupons.filter(c => 
    c.valid_until && new Date(c.valid_until) < new Date()
  ).length;
  const totalSavings = coupons.reduce((sum, c) => {
    if (c.discount_type === 'percentage') {
      return sum + (c.used_count * 50); // Estimated average savings per use
    }
    return sum + (c.used_count * c.discount_value);
  }, 0);

  const exportCoupons = () => {
    const csvData = [
      ["Code", "Name", "Type", "Value", "Usage", "Status", "Created", "Expires"],
      ...coupons.map(coupon => [
        coupon.code,
        coupon.name || "",
        coupon.discount_type,
        coupon.discount_value,
        `${coupon.used_count}${coupon.usage_limit ? `/${coupon.usage_limit}` : ""}`,
        coupon.is_active ? "Active" : "Inactive",
        new Date(coupon.created_at).toLocaleDateString(),
        coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : "No expiry"
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coupons-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center animate-pulse">
              <TicketPercent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            {/* Navigation */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                size="sm"
                className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
              >
                <Link href="/account" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 dark:from-orange-900/30 dark:via-orange-800/30 dark:to-orange-700/30 border-2 border-orange-200 dark:border-orange-800 flex items-center justify-center shadow-lg">
                    <TicketPercent className="h-7 w-7 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                    Coupons Management
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Create and manage discount coupons for your customers
                  </p>
                </div>
              </div>
              
              {/* Enhanced Action Buttons - Mobile Responsive with Reordered Layout */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                {/* Create Coupon Button - First on Mobile */}
                {settings?.is_enabled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowForm(true)}
                        className="group bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto order-1 sm:order-3"
                      >
                        <Plus className="h-4 w-4 sm:mr-2 group-hover:rotate-90 transition-transform duration-200" />
                        <span className="font-semibold">Create New Coupon</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create a new discount coupon</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Second Row on Mobile - Export and Refresh */}
                <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
                  {/* Export Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={exportCoupons}
                        variant="outline"
                        size="sm"
                        className="group border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex-1 sm:w-auto"
                        disabled={coupons.length === 0}
                      >
                        <Download className="h-4 w-4 sm:mr-2 group-hover:translate-y-0.5 transition-transform duration-200" />
                        <span className="hidden sm:inline">Export</span>
                        <span className="sm:hidden">Export CSV</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export coupons data to CSV</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Refresh Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={fetchData}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="group border-slate-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 flex-1 sm:w-auto"
                      >
                        <RefreshCw className={`h-4 w-4 sm:mr-2 group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">Refresh Data</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh coupons data</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Coupons
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {coupons.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Package2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Coupons
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {activeCoupons}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Usage
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {totalUsage}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Savings
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ₹{totalSavings.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <Percent className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Settings Panel */}
            <div className="xl:col-span-1">
              <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Settings className="h-5 w-5 mr-3 text-slate-600 dark:text-slate-400" />
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
            <div className="xl:col-span-3">
              <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center text-lg font-semibold">
                      <Filter className="h-5 w-5 mr-3 text-slate-600 dark:text-slate-400" />
                      All Coupons ({coupons.length})
                    </CardTitle>
                    {settings?.is_enabled && (
                      <Button
                        onClick={() => setShowForm(true)}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white sm:hidden shadow-md hover:shadow-lg transition-all duration-200 w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Coupon
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
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

          {/* Enhanced Help Section */}
          {!settings?.is_enabled && (
            <div className="mt-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-2xl"></div>
              <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <TicketPercent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                    Enable Coupons to Get Started
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm max-w-lg mx-auto leading-relaxed">
                    Turn on the coupon system in settings to start creating and managing discount codes for your customers. 
                    Boost sales and customer satisfaction with targeted promotions.
                  </p>
                  <div className="mt-6">
                    <div className="inline-flex items-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
                      <span className="flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Percentage & Fixed Discounts
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Date-based Validity
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        Usage Limits
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </TooltipProvider>
  );
}

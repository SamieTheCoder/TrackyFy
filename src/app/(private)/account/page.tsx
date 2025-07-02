"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import usersGlobalStore, {
  IUsersGlobalStore,
} from "@/global-store/users-store";
import dayjs from "dayjs";
import Link from "next/link";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  IndianRupee,
  User,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Download,
  CalendarSync,
  RefreshCw,
  Sparkles,
  Star,
  Crown,
  FolderKanban,
  Gem,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminDashboard from "./_components/admin-dashboard";
import SubscriptionProgressBar from "./_components/subscription-progress-bar";
import SubscriptionStats from "./_components/subscription-stats";
import QuickActions from "./_components/quick-actions";
import { generatePDFInvoice } from "./_utils/pdf-generator";

function AccountPage() {
  const { user, currentSubscription } = usersGlobalStore() as IUsersGlobalStore;
  const [refreshing, setRefreshing] = useState(false);

  // Calculate subscription progress with proper typing
  const subscriptionProgress = useMemo(() => {
    if (!currentSubscription) return null;

    const startDate = dayjs(currentSubscription.start_date);
    const endDate = dayjs(currentSubscription.end_date);
    const currentDate = dayjs();

    const totalDuration = endDate.diff(startDate, "day");
    const elapsed = currentDate.diff(startDate, "day");
    const remaining = endDate.diff(currentDate, "day");

    const progressPercentage = Math.min(
      Math.max((elapsed / totalDuration) * 100, 0),
      100
    );

    let status: "expired" | "expiring" | "active";
    if (remaining <= 0) {
      status = "expired";
    } else if (remaining <= 7) {
      status = "expiring";
    } else {
      status = "active";
    }

    return {
      progressPercentage,
      daysRemaining: Math.max(remaining, 0),
      totalDays: totalDuration,
      isExpiring: remaining <= 7 && remaining > 0,
      isExpired: remaining <= 0,
      status,
    };
  }, [currentSubscription]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Refresh function for subscription data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading("Refreshing subscription data...");

      // No refreshUserData in store, fallback to reload
      window.location.reload();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to refresh subscription data");
    } finally {
      setRefreshing(false);
    }
  };

  // Download PDF invoice functionality
  const downloadPDFInvoice = async () => {
    if (!currentSubscription) {
      toast.error("No subscription data available");
      return;
    }

    try {
      toast.loading("Generating PDF invoice...");

      const invoiceData = {
        subscriptionId: currentSubscription.id,
        planName: currentSubscription.plan?.name || "Unknown Plan",
        amount: currentSubscription.amount,
        startDate: dayjs(currentSubscription.start_date).format("MMM DD, YYYY"),
        endDate: dayjs(currentSubscription.end_date).format("MMM DD, YYYY"),
        purchaseDate: dayjs(currentSubscription.created_at).format(
          "MMM DD, YYYY"
        ),
        paymentId: currentSubscription.payment_id,
        duration: currentSubscription.total_duration,
        customerName: user?.name || "Unknown Customer",
        customerEmail: user?.email || "No email provided",
        paymentGateway: currentSubscription.payment_gateway || "razorpay",
      };

      await generatePDFInvoice(invoiceData);
      toast.dismiss();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF invoice");
      console.error("PDF generation error:", error);
    }
  };

  if (user?.is_admin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 border-3 border-white shadow-xl flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <PageTitle title={`Welcome back, ${user?.name}!`} />
              <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center">
                <Gem className="h-4 w-4 mr-2 text-violet-500" />
                Manage your subscription and account settings
              </p>
            </div>
          </div>
        </div>

        {!currentSubscription ? (
          /* Enhanced No Subscription State - Fixed Mobile Responsiveness */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Fixed Header for Mobile */}
              <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <CalendarSync className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                        No Active Subscription
                      </h2>
                      <p className="text-violet-600 dark:text-violet-400 flex items-center mt-1 text-sm sm:text-base">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          Start your journey with us today
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Refresh Button - Mobile Responsive */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <Button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 shadow-md"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                      <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Section - Mobile Optimized */}
              <div className="p-6 sm:p-8">
                <div className="text-center space-y-6 sm:space-y-8">
                  <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30 rounded-full flex items-center justify-center shadow-xl">
                    <CalendarSync className="h-12 w-12 sm:h-14 sm:w-14 text-violet-600 dark:text-violet-400" />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                      Ready to Get Started?
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-base sm:text-lg px-4 sm:px-0">
                      Choose from our flexible subscription plans and unlock all
                      the features our platform has to offer.
                    </p>
                  </div>

                  {/* Mobile Optimized Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center px-4 sm:px-0">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Link
                        href="/account/user/purchase-plan"
                        className="flex items-center justify-center"
                      >
                        <FolderKanban size={18} className="mr-2" />
                        <span>View Subscription Plans</span>
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-md"
                    >
                      <ExternalLink size={18} className="mr-2" />
                      <span>Learn More</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Active Subscription State */
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Subscription Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Progress Card */}
              {subscriptionProgress && (
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Subscription Progress
                          </h3>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex items-center shadow-md ${
                            subscriptionProgress.status === "expired"
                              ? "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                              : subscriptionProgress.status === "expiring"
                              ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              : "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {subscriptionProgress.status === "expired" ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Expired
                            </>
                          ) : subscriptionProgress.status === "expiring" ? (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Expiring Soon
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Active
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <SubscriptionProgressBar
                        progress={subscriptionProgress.progressPercentage}
                        daysRemaining={subscriptionProgress.daysRemaining}
                        status={subscriptionProgress.status}
                      />

                      <SubscriptionStats
                        subscriptionProgress={subscriptionProgress}
                      />

                      {subscriptionProgress.isExpiring && (
                        <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl shadow-lg">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                              <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-amber-800 dark:text-amber-200 font-bold text-lg">
                                🚨 Subscription Expiring Soon!
                              </h4>
                              <p className="text-amber-700 dark:text-amber-300 text-sm mt-2">
                                Your subscription expires in{" "}
                                {subscriptionProgress.daysRemaining} day(s).
                                Renew now to continue enjoying our services.
                              </p>
                              <Button
                                size="sm"
                                className="mt-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Link
                                  href="/account/user/purchase-plan"
                                  className="flex items-center"
                                >
                                  <TrendingUp size={16} className="mr-2" />
                                  Renew Now
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActions
                  subscriptionProgress={subscriptionProgress}
                  onDownloadInvoice={downloadPDFInvoice}
                />
              </div>
            </div>

            {/* Enhanced Detailed Subscription Information */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <CalendarSync className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Subscription Details
                    </h3>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center whitespace-nowrap shadow-md ${
                      subscriptionProgress?.isExpired
                        ? "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                        : "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    {subscriptionProgress?.isExpired ? (
                      <>
                        <XCircle className="inline h-4 w-4 mr-2" />
                        Expired
                      </>
                    ) : (
                      <>
                        <CheckCircle className="inline h-4 w-4 mr-2" />
                        Active
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Updated Subscription Details Grid - 2 columns, 4 rows with consistent sizing and subtle colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Subscription ID
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-600/50 px-2 py-1 rounded text-right">
                        {currentSubscription?.id}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            currentSubscription?.id?.toString() || "",
                            "Subscription ID"
                          )
                        }
                        className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <Crown className="h-4 w-4 mr-2" />
                      Plan
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {currentSubscription?.plan?.name}
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Start Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {dayjs(currentSubscription?.start_date).format(
                        "MMM DD, YYYY"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      End Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {dayjs(currentSubscription?.end_date).format(
                        "MMM DD, YYYY"
                      )}
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Purchase Date
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {dayjs(currentSubscription?.created_at).format(
                        "MMM DD, YYYY"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Duration
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                      {currentSubscription?.total_duration} days
                    </span>
                  </div>

                  {/* Row 4 */}
                  <div className="flex justify-between items-center p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Amount Paid
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-200 text-lg text-right">
                      ₹{currentSubscription?.amount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all duration-200 h-16">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Payment ID
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm max-w-[120px] truncate text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-600/50 px-2 py-1 rounded text-right">
                        {currentSubscription?.payment_id}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          copyToClipboard(
                            currentSubscription?.payment_id || "",
                            "Payment ID"
                          )
                        }
                        className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <Link
                      href="/account/user/subscriptions"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink size={18} className="mr-2" />
                      View All Subscriptions
                    </Link>
                  </Button>

                  <Button
                    onClick={downloadPDFInvoice}
                    variant="outline"
                    className="flex-1 border-2 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Download size={18} className="mr-2" />
                    Download PDF Invoice
                  </Button>

                  {subscriptionProgress?.isExpiring && (
                    <Button className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                      <Link
                        href="/account/user/purchase-plan"
                        className="flex items-center justify-center"
                      >
                        <TrendingUp size={18} className="mr-2" />
                        Renew Subscription
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountPage;

"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import usersGlobalStore, {
  IUsersGlobalStore,
} from "@/global-store/users-store";
import dayjs from "dayjs";
import Link from "next/link";
import { 
  CreditCard, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import AdminDashboard from "./_components/admin-dashboard";
import SubscriptionProgressBar from "./_components/subscription-progress-bar";
import SubscriptionStats from "./_components/subscription-stats";
import QuickActions from "./_components/quick-actions";
import { generatePDFInvoice } from "./_utils/pdf-generator";

function AccountPage() {
  const { user, currentSubscription } = usersGlobalStore() as IUsersGlobalStore;

  // Calculate subscription progress with proper typing
  const subscriptionProgress = useMemo(() => {
    if (!currentSubscription) return null;

    const startDate = dayjs(currentSubscription.start_date);
    const endDate = dayjs(currentSubscription.end_date);
    const currentDate = dayjs();
    
    const totalDuration = endDate.diff(startDate, 'day');
    const elapsed = currentDate.diff(startDate, 'day');
    const remaining = endDate.diff(currentDate, 'day');
    
    const progressPercentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    
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
      status
    };
  }, [currentSubscription]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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
        purchaseDate: dayjs(currentSubscription.created_at).format("MMM DD, YYYY"),
        paymentId: currentSubscription.payment_id,
        duration: currentSubscription.total_duration,
        customerName: user?.name || "Unknown Customer",
        customerEmail: user?.email || "No email provided",
        paymentGateway: currentSubscription.payment_gateway || "razorpay"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <PageTitle title={`Welcome back, ${user?.name}!`} />
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your subscription and account settings
              </p>
            </div>
          </div>
        </div>

        {!currentSubscription ? (
          /* No Subscription State */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">No Active Subscription</h2>
                    <p className="text-slate-600 dark:text-slate-400">Start your journey with us today</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Shield className="h-12 w-12 text-slate-500 dark:text-slate-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Ready to Get Started?
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      Choose from our flexible subscription plans and unlock all the features 
                      our platform has to offer.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                      <Link href="/account/user/purchase-plan" className="flex items-center">
                        <CreditCard size={20} className="mr-2" />
                        View Subscription Plans
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3 rounded-lg transition-all duration-200">
                      <ExternalLink size={20} className="mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Subscription State */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Subscription Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress Card */}
              {subscriptionProgress && (
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 dark:text-slate-400" />
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Subscription Progress</h3>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                          subscriptionProgress.status === 'expired' 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                            : subscriptionProgress.status === 'expiring'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {subscriptionProgress.status === 'expired' ? 'Expired' : 
                           subscriptionProgress.status === 'expiring' ? 'Expiring Soon' : 'Active'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <SubscriptionProgressBar 
                        progress={subscriptionProgress.progressPercentage}
                        daysRemaining={subscriptionProgress.daysRemaining}
                        status={subscriptionProgress.status}
                      />

                      <SubscriptionStats subscriptionProgress={subscriptionProgress} />

                      {subscriptionProgress.isExpiring && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-amber-800 dark:text-amber-200 font-medium">
                                Subscription Expiring Soon!
                              </h4>
                              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                                Your subscription expires in {subscriptionProgress.daysRemaining} day(s). 
                                Renew now to continue enjoying our services.
                              </p>
                              <Button 
                                size="sm" 
                                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                <Link href="/account/user/purchase-plan" className="flex items-center">
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

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActions 
                  subscriptionProgress={subscriptionProgress} 
                  onDownloadInvoice={downloadPDFInvoice}
                />
              </div>
            </div>

            {/* Detailed Subscription Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Subscription Details</h3>
                  </div>
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                    subscriptionProgress?.isExpired 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {subscriptionProgress?.isExpired ? (
                      <><XCircle className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />Expired</>
                    ) : (
                      <><CheckCircle className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />Active</>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Subscription ID
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-slate-900 dark:text-slate-100">{currentSubscription?.id}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(currentSubscription?.id?.toString() || '', 'Subscription ID')}
                          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Plan
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {currentSubscription?.plan?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Start Date
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {dayjs(currentSubscription?.start_date).format("MMM DD, YYYY")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        End Date
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {dayjs(currentSubscription?.end_date).format("MMM DD, YYYY")}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Purchase Date
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {dayjs(currentSubscription?.created_at).format("MMM DD, YYYY")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Duration
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {currentSubscription?.total_duration} days
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Amount Paid
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                        ₹{currentSubscription?.amount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Payment ID
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm max-w-[120px] truncate text-slate-900 dark:text-slate-100">
                          {currentSubscription?.payment_id}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(currentSubscription?.payment_id || '', 'Payment ID')}
                          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <Link href="/account/user/subscriptions" className="flex items-center justify-center">
                      <ExternalLink size={18} className="mr-2" />
                      View All Subscriptions
                    </Link>
                  </Button>
                  
                  <Button 
                    onClick={downloadPDFInvoice}
                    variant="outline" 
                    className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-3 rounded-lg transition-all duration-200"
                  >
                    <Download size={18} className="mr-2" />
                    Download PDF Invoice
                  </Button>
                  
                  {subscriptionProgress?.isExpiring && (
                    <Button className="flex-1 bg-slate-700 hover:bg-slate-600 dark:bg-slate-300 dark:hover:bg-slate-400 text-white dark:text-slate-900 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                      <Link href="/account/user/purchase-plan" className="flex items-center justify-center">
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

"use client";
import React, { useEffect, useState } from "react";
import RevenueChart from "./revenue-chart";
import ExpiringSubscriptionsWidget from "./expiring-subscriptions-widget";
import SubscriptionExpiryChart from "./subscription-expiry-chart";

import {
  getUsersReport,
  getSubscriptionsReport,
  getMonthlyRevenueReport,
  getExpiringSubscriptions,
  getExpiredSubscriptions,
  getSubscriptionExpiryStats,
} from "@/actions/dashboard";
import toast from "react-hot-toast";
import { 
  Users, 
  UserCog, 
  User, 
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  TrendingDown,
  Package,
  RefreshCw,
  Calendar,
  Clock,
  IndianRupee
} from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";

function AdminDashboard() {
  const [userData, setUserData] = useState({
    users_count: 0,
    customers_count: 0,
    admins_count: 0,
  });

  const [subscriptionData, setSubscriptionData] = useState({
    subscriptions_count: 0,
    total_revenue: 0,
  });

  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);
  const [expiredSubscriptions, setExpiredSubscriptions] = useState([]);
  const [expiryStats, setExpiryStats] = useState({
    expiring_today: 0,
    expiring_this_week: 0,
    expired_this_week: 0,
    expiring_next_week: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users data
      const usersReportResponse = await getUsersReport();
      if (usersReportResponse.success) {
        setUserData(
          usersReportResponse.data || {
            users_count: 0,
            customers_count: 0,
            admins_count: 0,
          }
        );
      } else {
        console.error("User report failed:", usersReportResponse.message);
        toast.error(usersReportResponse.message);
      }

      // Fetch subscriptions data
      const subscriptionsReportResponse = await getSubscriptionsReport();
      if (subscriptionsReportResponse.success) {
        setSubscriptionData(
          subscriptionsReportResponse.data || {
            subscriptions_count: 0,
            total_revenue: 0,
          }
        );
      } else {
        console.error("Subscription report failed:", subscriptionsReportResponse.message);
        toast.error(subscriptionsReportResponse.message);
      }

      // Fetch monthly revenue data
      const monthlyRevenueResponse = await getMonthlyRevenueReport();
      if (monthlyRevenueResponse.success) {
        setMonthlyRevenueData(monthlyRevenueResponse.data || []);
      } else {
        console.error("Monthly revenue report failed:", monthlyRevenueResponse.message);
        toast.error(monthlyRevenueResponse.message);
      }

      // Fetch expiring subscriptions
      const expiringResponse = await getExpiringSubscriptions();
      if (expiringResponse.success) {
        setExpiringSubscriptions(expiringResponse.data || []);
      }

      // Fetch expired subscriptions
      const expiredResponse = await getExpiredSubscriptions();
      if (expiredResponse.success) {
        setExpiredSubscriptions(expiredResponse.data || []);
      }

      // Fetch expiry statistics
      const expiryStatsResponse = await getSubscriptionExpiryStats();
      if (expiryStatsResponse.success) {
        setExpiryStats(expiryStatsResponse.data || {
          expiring_today: 0,
          expiring_this_week: 0,
          expired_this_week: 0,
          expiring_next_week: 0,
        });
      }

    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Status badge component similar to subscription page
  const getStatusBadge = (label: string, isAlert: boolean = false) => {
    if (isAlert) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {label}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center">
        {label}
      </span>
    );
  };

// Metric card component similar to subscription cards
const MetricCard= ({
  title,
  value,
  description,
  icon: Icon,
  isCurrency = false,
  isAlert = false,
}: {
  title: string;
  value: number;
  description: string;
  icon: any;
  isCurrency?: boolean;
  isAlert?: boolean;
}) => (
  <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 space-x-4">
    <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-700">
      <Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{title}</h3>
        {getStatusBadge(isAlert ? 'Alert' : 'Active', isAlert)}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {isCurrency ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
  </div>
);






  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
              <Spinner parentHeight="100%" />
            </div>
          )}

          {/* Header - Same style as subscriptions page */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <PageTitle title="Admin Dashboard" />
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                  Overview and management of your gym system
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mb-6">
            <Button 
              onClick={fetchData}
              disabled={loading}
              variant="outline" 
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Metrics Grid - Same style as subscriptions page */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={userData.users_count || 0}
              description="Total number of users in the system"
              icon={Users}
            />

            <MetricCard
              title="Total Customers"
              value={userData.customers_count || 0}
              description="Users with regular accounts"
              icon={User}
            />

            <MetricCard
              title="Total Subscriptions"
              value={subscriptionData.subscriptions_count || 0}
              description="Number of active subscriptions"
              icon={CreditCard}
            />

            <MetricCard
              title="Total Revenue"
              value={subscriptionData.total_revenue || 0}
              description="Revenue generated from subscriptions"
              icon={IndianRupee}
              isCurrency={true}
            />

            <MetricCard
              title="Expiring Today"
              value={expiryStats.expiring_today || 0}
              description="Subscriptions expiring today"
              icon={AlertTriangle}
              isAlert={expiryStats.expiring_today > 0}
            />

            <MetricCard
              title="Expiring This Week"
              value={expiryStats.expiring_this_week || 0}
              description="Subscriptions expiring in 7 days"
              icon={Clock}
              isAlert={expiryStats.expiring_this_week > 0}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <RevenueChart data={monthlyRevenueData} />
            <SubscriptionExpiryChart 
              expiringToday={expiryStats.expiring_today}
              expiringThisWeek={expiryStats.expiring_this_week}
              expiringNextWeek={expiryStats.expiring_next_week}
              expiredThisWeek={expiryStats.expired_this_week}
            />
          </div>

          {/* Expiring Subscriptions Widget */}
          <div className="mb-8">
            <ExpiringSubscriptionsWidget 
              expiringSubscriptions={expiringSubscriptions}
              expiredSubscriptions={expiredSubscriptions}
              onRefresh={fetchData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

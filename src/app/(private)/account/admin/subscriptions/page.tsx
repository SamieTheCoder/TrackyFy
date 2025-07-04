"use client";

import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import {
  getAllSubscriptions,
  deleteSubscription,
} from "@/actions/subscriptions";
import PageTitle from "@/components/ui/page-title";
import { ISubscription } from "@/interfaces";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  IndianRupee,
  TrendingUp,
  Users,
  Eye,
  ChevronRight,
  MoreVertical,
  Activity,
  CreditCard,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  Tag,
  CalendarSync,
  Sparkles,
  Banknote,
  Smartphone,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortField =
  | "id"
  | "created_at"
  | "user"
  | "start_date"
  | "end_date"
  | "plan"
  | "amount"
  | "payment_id";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "active" | "expired" | "expiring";
type PaymentFilter = "all" | "cash" | "online";

// Utility functions
const getSubscriptionStatus = (subscription: ISubscription) => {
  const now = dayjs();
  const endDate = dayjs(subscription.end_date);
  const daysRemaining = endDate.diff(now, "day");

  if (daysRemaining < 0) return "expired";
  if (daysRemaining <= 7) return "expiring";
  return "active";
};

const getPaymentType = (subscription: ISubscription) => {
  if (subscription.is_cash_approval) return "cash";
  return subscription.payment_gateway || "online";
};

const getPaymentBadge = (subscription: ISubscription) => {
  if (subscription.is_cash_approval) {
    return {
      txt: "Cash",
      color:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      icon: Banknote,
    };
  }

  switch (subscription.payment_gateway) {
    case "stripe":
      return {
        txt: "Stripe",
        color:
          "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
        icon: CreditCard,
      };
    case "cash":
      return {
        txt: "Cash",
        color:
          "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        icon: Banknote,
      };
    default:
      return {
        txt: "Razorpay",
        color:
          "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        icon: Smartphone,
      };
  }
};

// Memoized Status Badges Component with larger size and names
const StatusBadges = memo(
  ({
    subscription,
    compact = false,
  }: {
    subscription: ISubscription;
    compact?: boolean;
  }) => {
    const badges = [];
    const status = getSubscriptionStatus(subscription);
    const paymentBadge = getPaymentBadge(subscription);
    const hasDiscount =
      subscription.discount_amount && subscription.discount_amount > 0;

    // Status badge - larger size with names
    switch (status) {
      case "expired":
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 ${
              compact ? "gap-1" : "gap-1.5"
            }`}
          >
            <Activity className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
            Expired
          </span>
        );
        break;
      case "expiring":
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ${
              compact ? "gap-1" : "gap-1.5"
            }`}
          >
            <Activity className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
            Expiring Soon
          </span>
        );
        break;
      default:
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${
              compact ? "gap-1" : "gap-1.5"
            }`}
          >
            <Activity className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
            Active
          </span>
        );
    }

    // Payment type badge - larger size with names
    const PaymentIcon = paymentBadge.icon;
    badges.push(
      <span
        key="payment"
        className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg border ${
          paymentBadge.color
        } ${compact ? "gap-1" : "gap-1.5"}`}
      >
        <PaymentIcon className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
        {paymentBadge.txt}
      </span>
    );

    // Discount indicator - larger size with names
    if (hasDiscount) {
      badges.push(
        <span
          key="discount"
          className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 ${
            compact ? "gap-1" : "gap-1.5"
          }`}
        >
          <Tag className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          Discount Applied
        </span>
      );
    }

    return <div className="flex flex-wrap gap-1.5">{badges}</div>;
  }
);

StatusBadges.displayName = "StatusBadges";

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedSubscription, setSelectedSubscription] =
    useState<ISubscription | null>(null);
  const [subscriptionDetailOpen, setSubscriptionDetailOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      { key: "id", label: "Subscription ID" },
      { key: "user", label: "Customer" },
      { key: "plan", label: "Plan" },
      { key: "amount", label: "Amount" },
      { key: "created_at", label: "Purchase Date" },
      { key: "start_date", label: "Start Date" },
      { key: "end_date", label: "End Date" },
      { key: "payment_id", label: "Payment ID" },
    ],
    []
  );

  // Fetch data
  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await getAllSubscriptions();
      if (!response.success) {
        throw new Error(response.message);
      }
      setSubscriptions(response.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  // Copy payment ID
  const copyPaymentId = useCallback(async (paymentId: string) => {
    try {
      await navigator.clipboard.writeText(paymentId);
      setCopiedPaymentId(paymentId);
      toast.success("Payment ID copied!");
      setTimeout(() => setCopiedPaymentId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy payment ID");
    }
  }, []);

  // Analytics data with cash vs online separation
  const analyticsData = useMemo(() => {
    if (!subscriptions.length) return null;

    const cashSubscriptions = subscriptions.filter(
      (sub) => sub.is_cash_approval
    );
    const onlineSubscriptions = subscriptions.filter(
      (sub) => !sub.is_cash_approval
    );

    const monthlyData = subscriptions.reduce((acc: any, sub) => {
      const month = dayjs(sub.created_at).format("YYYY-MM");
      const monthLabel = dayjs(sub.created_at).format("MMM YYYY");
      const paymentType = sub.is_cash_approval ? "cash" : "online";

      if (!acc[month]) {
        // FIXED: Ensure consistent property order
        acc[month] = {
          month: monthLabel,
          cashRevenue: 0, // Always initialize cashRevenue first
          onlineRevenue: 0, // Always initialize onlineRevenue second
          totalSubscriptions: 0,
          totalRevenue: 0,
          cashSubscriptions: 0,
          onlineSubscriptions: 0,
        };
      }

      acc[month].totalSubscriptions += 1;
      acc[month].totalRevenue += sub.amount;

      if (paymentType === "cash") {
        acc[month].cashSubscriptions += 1;
        acc[month].cashRevenue += sub.amount;
      } else {
        acc[month].onlineSubscriptions += 1;
        acc[month].onlineRevenue += sub.amount;
      }

      return acc;
    }, {});

    const monthlyStats = Object.values(monthlyData)
      .map((data: any) => ({
        month: data.month,
        cashRevenue: data.cashRevenue || 0, // Consistent order
        onlineRevenue: data.onlineRevenue || 0, // Consistent order
        totalSubscriptions: data.totalSubscriptions || 0,
        totalRevenue: data.totalRevenue || 0,
        cashSubscriptions: data.cashSubscriptions || 0,
        onlineSubscriptions: data.onlineSubscriptions || 0,
      }))
      .sort(
        (a: any, b: any) =>
          dayjs(a.month, "MMM YYYY").valueOf() -
          dayjs(b.month, "MMM YYYY").valueOf()
      );

    const paymentMethodData = [
      {
        name: "Cash Payments",
        value: cashSubscriptions.length,
        revenue: cashSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
        color: "#10b981",
      },
      {
        name: "Online Payments",
        value: onlineSubscriptions.length,
        revenue: onlineSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
        color: "#3b82f6",
      },
    ];

    const now = dayjs();
    const statusData = subscriptions.reduce((acc: any, sub) => {
      const endDate = dayjs(sub.end_date);
      const daysRemaining = endDate.diff(now, "day");

      let status = "active";
      if (daysRemaining < 0) status = "expired";
      else if (daysRemaining <= 7) status = "expiring";

      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = subscriptions.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );
    const cashRevenue = cashSubscriptions.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );
    const onlineRevenue = onlineSubscriptions.reduce(
      (sum, sub) => sum + sub.amount,
      0
    );

    return {
      totalSubscriptions: subscriptions.length,
      totalRevenue,
      cashSubscriptions: cashSubscriptions.length,
      onlineSubscriptions: onlineSubscriptions.length,
      cashRevenue,
      onlineRevenue,
      avgRevenuePerSub: totalRevenue / subscriptions.length,
      monthlyStats,
      paymentMethodData,
      statusData: [
        { name: "Active", value: statusData.active || 0, color: "#10b981" },
        {
          name: "Expiring Soon",
          value: statusData.expiring || 0,
          color: "#f59e0b",
        },
        { name: "Expired", value: statusData.expired || 0, color: "#ef4444" },
      ],
    };
  }, [subscriptions]);

  // Sort handling
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        return prev;
      } else {
        setSortDirection("asc");
        return field;
      }
    });
  }, []);

  const renderSortIcon = useCallback(
    (field: string) => {
      if (sortField !== field)
        return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
      return sortDirection === "asc" ? (
        <ArrowUp
          size={14}
          className="ml-1 text-slate-600 dark:text-slate-400"
        />
      ) : (
        <ArrowDown
          size={14}
          className="ml-1 text-slate-600 dark:text-slate-400"
        />
      );
    },
    [sortField, sortDirection]
  );

  // Filtered and sorted subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((subscription) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        subscription.plan?.name?.toLowerCase().includes(term) ||
        subscription.user?.name?.toLowerCase().includes(term) ||
        subscription.payment_id?.toLowerCase().includes(term) ||
        subscription.id?.toString().includes(term);

      if (!matchesSearch) return false;

      if (filterStatus !== "all") {
        const status = getSubscriptionStatus(subscription);
        if (status !== filterStatus) return false;
      }

      if (paymentFilter !== "all") {
        const paymentType = subscription.is_cash_approval ? "cash" : "online";
        if (paymentType !== paymentFilter) return false;
      }

      if (selectedMonth) {
        const subMonth = dayjs(subscription.created_at).format("YYYY-MM");
        if (subMonth !== selectedMonth) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "user":
          aValue = a.user?.name || "";
          bValue = b.user?.name || "";
          break;
        case "plan":
          aValue = a.plan?.name || "";
          bValue = b.plan?.name || "";
          break;
        case "created_at":
        case "start_date":
        case "end_date":
          aValue = new Date(a[sortField]).getTime();
          bValue = new Date(b[sortField]).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [
    subscriptions,
    sortField,
    sortDirection,
    searchTerm,
    filterStatus,
    paymentFilter,
    selectedMonth,
  ]);

  // Export data
  const exportData = useCallback(() => {
    const csvData = [
      [
        "Subscription ID",
        "Customer",
        "Plan",
        "Amount",
        "Start Date",
        "End Date",
        "Status",
        "Payment Type",
        "Payment ID",
      ],
      ...filteredAndSortedSubscriptions.map((sub) => [
        sub.id,
        sub.user?.name || "Unknown",
        sub.plan?.name || "Unknown",
        sub.amount,
        dayjs(sub.start_date).format("YYYY-MM-DD"),
        dayjs(sub.end_date).format("YYYY-MM-DD"),
        getSubscriptionStatus(sub),
        getPaymentType(sub),
        sub.payment_id,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscriptions-${dayjs().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAndSortedSubscriptions]);

  // Remove subscription
  const removeSub = useCallback(
    async (id: string | number) => {
      if (!confirm("Delete subscription?")) return;
      const numericId = typeof id === "string" ? parseInt(id) : id;
      const res = await deleteSubscription(numericId);
      toast[res.success ? "success" : "error"](res.message);
      res.success && getData();
    },
    [getData]
  );

  // Handle subscription click
  const handleSubscriptionClick = useCallback((subscription: ISubscription) => {
    setOpenDropdownId(null);
    setSelectedSubscription(subscription);
    setSubscriptionDetailOpen(true);
  }, []);

  // Handle dropdown state
  const handleDropdownOpenChange = useCallback(
    (subscriptionId: string, open: boolean) => {
      setOpenDropdownId(open ? subscriptionId : null);
    },
    []
  );

  // Available months
  const availableMonths = useMemo(() => {
    const months = subscriptions.map((sub) => ({
      value: dayjs(sub.created_at).format("YYYY-MM"),
      label: dayjs(sub.created_at).format("MMM YYYY"),
    }));

    const uniqueMonths = months.filter(
      (month, index, self) =>
        index === self.findIndex((m) => m.value === month.value)
    );

    return uniqueMonths.sort(
      (a, b) => dayjs(a.value).valueOf() - dayjs(b.value).valueOf()
    );
  }, [subscriptions]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("all");
    setPaymentFilter("all");
    setSelectedMonth("");
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center animate-pulse">
              <CalendarSync className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="relative">
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
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900/30 dark:via-blue-800/30 dark:to-blue-700/30 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-lg">
                      <CalendarSync className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                      Subscriptions Management
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      Manage and analyze all subscription data with payment
                      insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            {analyticsData && (
              <Tabs defaultValue="analytics" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Total Subscriptions
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {analyticsData.totalSubscriptions}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Total Revenue
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              ₹{analyticsData.totalRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Cash Payments
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {analyticsData.cashSubscriptions}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ₹{analyticsData.cashRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Banknote className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Online Payments
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {analyticsData.onlineSubscriptions}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ₹{analyticsData.onlineRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Method Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Method Distribution</CardTitle>
                        <CardDescription>
                          Cash vs Online payment breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={analyticsData.paymentMethodData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {analyticsData.paymentMethodData.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                        <CardDescription>
                          Current status distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={analyticsData.statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {analyticsData.statusData.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Revenue Chart with Cash vs Online - FIXED */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Revenue Breakdown</CardTitle>
                        <CardDescription>
                          Cash vs Online payment trends
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.monthlyStats}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis
                                tickFormatter={(value) => `₹${value}`}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip
                                formatter={(
                                  value: number,
                                  name: string,
                                  props: any
                                ) => {
                                  // Use dataKey from props for 100% accuracy
                                  const { dataKey } = props;

                                  // Primary check using dataKey (most reliable)
                                  if (dataKey === "cashRevenue") {
                                    return [
                                      `₹${value.toLocaleString()}`,
                                      "Cash Revenue",
                                    ];
                                  }
                                  if (dataKey === "onlineRevenue") {
                                    return [
                                      `₹${value.toLocaleString()}`,
                                      "Online Revenue",
                                    ];
                                  }

                                  // Fallback check using name parameter
                                  if (name === "Cash Revenue") {
                                    return [
                                      `₹${value.toLocaleString()}`,
                                      "Cash Revenue",
                                    ];
                                  }
                                  if (name === "Online Revenue") {
                                    return [
                                      `₹${value.toLocaleString()}`,
                                      "Online Revenue",
                                    ];
                                  }

                                  // Final fallback
                                  return [`₹${value.toLocaleString()}`, name];
                                }}
                                labelFormatter={(label) => `Month: ${label}`}
                              />
                              <Bar
                                dataKey="cashRevenue"
                                fill="#10b981"
                                name="Cash Revenue"
                              />
                              <Bar
                                dataKey="onlineRevenue"
                                fill="#3b82f6"
                                name="Online Revenue"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Monthly Subscription Count */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Subscription Trends</CardTitle>
                        <CardDescription>
                          Subscription growth over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.monthlyStats}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                              />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="totalSubscriptions"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Total Subscriptions"
                              />
                              <Line
                                type="monotone"
                                dataKey="cashSubscriptions"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Cash Subscriptions"
                              />
                              <Line
                                type="monotone"
                                dataKey="onlineSubscriptions"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Online Subscriptions"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-6">
                  {/* Filters and Actions */}
                  <div className="mb-6 space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search by customer, plan, or payment ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="relative">
                        <select
                          value={filterStatus}
                          onChange={(e) =>
                            setFilterStatus(e.target.value as FilterStatus)
                          }
                          className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="expiring">Expiring</option>
                          <option value="expired">Expired</option>
                        </select>
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Payment Filter */}
                      <div className="relative">
                        <select
                          value={paymentFilter}
                          onChange={(e) =>
                            setPaymentFilter(e.target.value as PaymentFilter)
                          }
                          className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                        >
                          <option value="all">All Payments</option>
                          <option value="cash">Cash</option>
                          <option value="online">Online</option>
                        </select>
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Month Filter */}
                      <div className="relative">
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                        >
                          <option value="">All Months</option>
                          {availableMonths.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={getData}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                              loading ? "animate-spin" : ""
                            }`}
                          />
                          Refresh
                        </Button>
                        <Button
                          onClick={exportData}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Sort Options - Hidden on mobile */}
                    <div className="hidden md:flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sort by:
                      </span>
                      {columns.map((column) => (
                        <button
                          key={column.key}
                          onClick={() => handleSort(column.key as SortField)}
                          className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-colors ${
                            sortField === column.key
                              ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {column.label}
                          {renderSortIcon(column.key)}
                        </button>
                      ))}
                    </div>

                    {/* Results Summary */}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {filteredAndSortedSubscriptions.length} of{" "}
                      {subscriptions.length} subscriptions
                    </div>
                  </div>

                  {/* No Subscriptions Found */}
                  {!subscriptions.length && !loading && (
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                      <CalendarSync className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">
                        No subscriptions found in the system.
                      </p>
                    </div>
                  )}

                  {/* No Search Results */}
                  {subscriptions.length > 0 &&
                    !filteredAndSortedSubscriptions.length &&
                    !loading && (
                      <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          No subscriptions match your current search and filter
                          criteria.
                        </p>
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}

                  {/* Subscriptions List */}
                  {filteredAndSortedSubscriptions.length > 0 && !loading && (
                    <>
                      {/* Desktop View */}
                      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                          <div className="grid grid-cols-12 gap-2 items-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-2">Customer</div>
                            <div className="col-span-2">Plan</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-2">Period</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1 text-right">Actions</div>
                          </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {filteredAndSortedSubscriptions.map(
                            (subscription) => (
                              <div
                                key={subscription.id}
                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              >
                                <div className="grid grid-cols-12 gap-2 items-center">
                                  {/* ID */}
                                  <div className="col-span-1">
                                    <span className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md border">
                                      #{subscription.id}
                                    </span>
                                  </div>

                                  {/* Customer */}
                                  <div className="col-span-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-white">
                                          {subscription.user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {subscription.user?.name ||
                                          "Unknown User"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Plan */}
                                  <div className="col-span-2">
                                    <span className="text-sm text-slate-900 dark:text-slate-100 truncate">
                                      {subscription.plan?.name || "—"}
                                    </span>
                                  </div>

                                  {/* Amount */}
                                  <div className="col-span-2">
                                    <div className="space-y-1.5">
                                      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        ₹{subscription.amount.toLocaleString()}
                                      </div>
                                      {subscription.discount_amount &&
                                      subscription.discount_amount > 0 ? (
                                        <div className="flex items-center space-x-1">
                                          <Tag className="h-3.5 w-3.5 text-green-600" />
                                          <span className="text-sm text-green-600 font-medium">
                                            -₹
                                            {subscription.discount_amount.toLocaleString()}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-1">
                                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                            No Discount
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Period */}
                                  <div className="col-span-2">
                                    <div className="space-y-1">
                                      <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {dayjs(subscription.start_date).format(
                                          "DD MMM"
                                        )}{" "}
                                        -{" "}
                                        {dayjs(subscription.end_date).format(
                                          "DD MMM YY"
                                        )}
                                      </div>
                                      <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Purchased:{" "}
                                        {dayjs(subscription.created_at).format(
                                          "DD MMM YY"
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <div className="col-span-2">
                                    <StatusBadges
                                      subscription={subscription}
                                      compact
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className="col-span-1 text-right">
                                    <DropdownMenu
                                      open={
                                        openDropdownId ===
                                        subscription.id?.toString()
                                      }
                                      onOpenChange={(open) =>
                                        handleDropdownOpenChange(
                                          subscription.id?.toString() || "",
                                          open
                                        )
                                      }
                                    >
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubscriptionClick(
                                              subscription
                                            );
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        {subscription.payment_id && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              copyPaymentId(
                                                subscription.payment_id || ""
                                              )
                                            }
                                          >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Payment ID
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          onClick={() =>
                                            removeSub(subscription.id)
                                          }
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden space-y-3">
                        {filteredAndSortedSubscriptions.map((subscription) => (
                          <div
                            key={subscription.id}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() =>
                              handleSubscriptionClick(subscription)
                            }
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {subscription.user?.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                    {subscription.plan?.name || "Unknown Plan"}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {subscription.user?.name ||
                                      `Subscription #${subscription.id}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            </div>

                            {/* Amount and Date Row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <IndianRupee className="h-4 w-4 text-slate-400" />
                                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                  ₹{subscription.amount.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {dayjs(subscription.start_date).format(
                                    "MMM DD"
                                  )}{" "}
                                  -{" "}
                                  {dayjs(subscription.end_date).format(
                                    "MMM DD, YY"
                                  )}
                                </div>
                                <div className="text-xs text-slate-400">
                                  Purchased:{" "}
                                  {dayjs(subscription.created_at).format(
                                    "MMM DD, YY"
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Badges Section - Separate row with proper spacing */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                              <div className="flex flex-wrap gap-2">
                                <StatusBadges
                                  subscription={subscription}
                                  compact={true}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Subscription Detail Modal */}
            <Dialog
              open={subscriptionDetailOpen}
              onOpenChange={(open) => {
                setSubscriptionDetailOpen(open);
                if (!open) {
                  setOpenDropdownId(null);
                }
              }}
            >
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-base">
                    <CalendarSync className="h-4 w-4 mr-2" />
                    Subscription Details
                  </DialogTitle>
                </DialogHeader>
                {selectedSubscription && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {selectedSubscription.user?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {selectedSubscription.plan?.name || "Unknown Plan"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          #{selectedSubscription.id}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Customer
                          </span>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {selectedSubscription.user?.name ||
                            "Unknown Customer"}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <IndianRupee className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Amount
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            ₹{selectedSubscription.amount.toLocaleString()}
                          </span>
                          {selectedSubscription.discount_amount &&
                            selectedSubscription.discount_amount > 0 && (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  Discount: -₹
                                  {selectedSubscription.discount_amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Duration
                          </span>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {dayjs(selectedSubscription.start_date).format(
                            "MMM DD, YY"
                          )}{" "}
                          -{" "}
                          {dayjs(selectedSubscription.end_date).format(
                            "MMM DD, YY"
                          )}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Purchase Date
                          </span>
                        </div>
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {dayjs(selectedSubscription.created_at).format(
                            "MMM DD, YYYY"
                          )}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Status & Payment
                          </span>
                        </div>
                        <StatusBadges subscription={selectedSubscription} />
                      </div>

                      {selectedSubscription.payment_id && (
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Payment ID:
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded border">
                                {selectedSubscription.payment_id}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  copyPaymentId(
                                    selectedSubscription.payment_id || ""
                                  )
                                }
                              >
                                {copiedPaymentId ===
                                selectedSubscription.payment_id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSubscriptionDetailOpen(false);
                          removeSub(selectedSubscription.id);
                        }}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Subscription
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AdminSubscriptions;

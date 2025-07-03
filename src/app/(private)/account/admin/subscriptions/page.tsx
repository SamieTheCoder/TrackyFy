"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Package,
  Eye,
  ChevronRight,
  MoreVertical,
  Activity,
  CreditCard,
  Trash2,
  XCircle,
  Percent,
  Copy,
  Check,
  Tag,
  Clock,
  AlertTriangle,
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
  PieChart,
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
type Badge = { txt: string; color: string };

const statusBadge = (s: ISubscription): Badge => {
  const today = dayjs();
  const daysLeft = dayjs(s.end_date).diff(today, "day");

  if (daysLeft < 0)
    return { txt: "Expired", color: "bg-red-100 text-red-600 border-red-200" };
  if (daysLeft <= 7)
    return {
      txt: "Expiring",
      color: "bg-amber-100 text-amber-600 border-amber-200",
    };
  return {
    txt: "Active",
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
  };
};

const paymentBadge = (gateway?: string): Badge => {
  switch (gateway) {
    case "stripe":
      return {
        txt: "Stripe",
        color: "bg-indigo-100 text-indigo-600 border-indigo-200",
      };
    case "cash":
      return {
        txt: "Cash",
        color: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return {
        txt: "Razorpay",
        color: "bg-blue-100 text-blue-600 border-blue-200",
      };
  }
};

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedSubscription, setSelectedSubscription] =
    useState<ISubscription | null>(null);
  const [subscriptionDetailOpen, setSubscriptionDetailOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null);

  const columns = [
    { key: "id", label: "Subscription ID" },
    { key: "created_at", label: "Purchase Date" },
    { key: "user", label: "Customer" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Amount" },
    { key: "payment_id", label: "Payment ID" },
  ];

  const getData = async () => {
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
  };

  useEffect(() => {
    getData();
  }, []);

  // Copy payment ID function
  const copyPaymentId = async (paymentId: string) => {
    try {
      await navigator.clipboard.writeText(paymentId);
      setCopiedPaymentId(paymentId);
      toast.success("Payment ID copied to clipboard!");
      setTimeout(() => setCopiedPaymentId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy payment ID");
    }
  };

  // Analytics calculations
  const analyticsData = useMemo(() => {
    if (!subscriptions.length) return null;

    // Monthly subscription data
    const monthlyData = subscriptions.reduce((acc: any, sub) => {
      const month = dayjs(sub.created_at).format("YYYY-MM");
      const monthLabel = dayjs(sub.created_at).format("MMM YYYY");

      if (!acc[month]) {
        acc[month] = {
          month: monthLabel,
          subscriptions: 0,
          revenue: 0,
          customers: new Set(),
        };
      }

      acc[month].subscriptions += 1;
      acc[month].revenue += sub.amount;
      acc[month].customers.add(sub.user?.name || "Unknown");

      return acc;
    }, {});

    const monthlyStats = Object.values(monthlyData).map((data: any) => ({
      ...data,
      customers: data.customers.size,
    }));

    // Plan distribution
    const planData = subscriptions.reduce((acc: any, sub) => {
      const planName = sub.plan?.name || "Unknown Plan";
      if (!acc[planName]) {
        acc[planName] = { name: planName, count: 0, revenue: 0 };
      }
      acc[planName].count += 1;
      acc[planName].revenue += sub.amount;
      return acc;
    }, {});

    const planStats = Object.values(planData);

    // Status distribution
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

    return {
      totalSubscriptions: subscriptions.length,
      totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.amount, 0),
      avgRevenuePerSub:
        subscriptions.reduce((sum, sub) => sum + sub.amount, 0) /
        subscriptions.length,
      monthlyStats: monthlyStats.sort(
        (a, b) =>
          dayjs(a.month, "MMM YYYY").valueOf() -
          dayjs(b.month, "MMM YYYY").valueOf()
      ),
      planStats,
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field)
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-slate-600 dark:text-slate-400" />
    ) : (
      <ArrowDown
        size={14}
        className="ml-1 text-slate-600 dark:text-slate-400"
      />
    );
  };

  const getSubscriptionStatus = (subscription: ISubscription) => {
    const now = dayjs();
    const endDate = dayjs(subscription.end_date);
    const daysRemaining = endDate.diff(now, "day");

    if (daysRemaining < 0) return "expired";
    if (daysRemaining <= 7) return "expiring";
    return "active";
  };

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((subscription) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        subscription.plan?.name?.toLowerCase().includes(term) ||
        subscription.user?.name?.toLowerCase().includes(term) ||
        subscription.payment_id?.toLowerCase().includes(term) ||
        subscription.id?.toString().includes(term);

      if (!matchesSearch) return false;

      // Status filter
      if (filterStatus !== "all") {
        const status = getSubscriptionStatus(subscription);
        if (status !== filterStatus) return false;
      }

      // Month filter
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
    selectedMonth,
  ]);

  const exportData = () => {
    const csvData = [
      [
        "Subscription ID",
        "Customer",
        "Plan",
        "Amount",
        "Start Date",
        "End Date",
        "Status",
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
  };

  const removeSub = async (id: string | number) => {
    if (!confirm("Delete subscription?")) return;
    // Convert string id to number for the API call
    const numericId = typeof id === "string" ? parseInt(id) : id;
    const res = await deleteSubscription(numericId);
    toast[res.success ? "success" : "error"](res.message);
    res.success && getData();
  };

  const handleSubscriptionClick = (subscription: ISubscription) => {
    setOpenDropdownId(null);
    setSelectedSubscription(subscription);
    setSubscriptionDetailOpen(true);
  };

  const handleDropdownOpenChange = (subscriptionId: string, open: boolean) => {
    if (open) {
      setOpenDropdownId(subscriptionId);
    } else {
      setOpenDropdownId(null);
    }
  };

  // Get unique months for filter
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

  // Close dropdown when dialog opens/closes
  useEffect(() => {
    if (subscriptionDetailOpen) {
      setOpenDropdownId(null);
    }
  }, [subscriptionDetailOpen]);

  // Get status and type badges with compact option
  const getStatusAndTypeBadges = (
    subscription: ISubscription,
    compact = false
  ) => {
    const badges = [];
    const status = getSubscriptionStatus(subscription);
    const hasDiscount =
      subscription.discount_amount && subscription.discount_amount > 0;

    // Status badge (always first)
    switch (status) {
      case "expired":
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 ${
              compact ? "gap-0.5" : "gap-1"
            }`}
          >
            <Activity className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
            {!compact && "Expired"}
          </span>
        );
        break;
      case "expiring":
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ${
              compact ? "gap-0.5" : "gap-1"
            }`}
          >
            <Activity className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
            {!compact && "Expiring"}
          </span>
        );
        break;
      default:
        badges.push(
          <span
            key="status"
            className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${
              compact ? "gap-0.5" : "gap-1"
            }`}
          >
            <Activity className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
            {!compact && "Active"}
          </span>
        );
    }

    // Payment type badge
    const payB = paymentBadge(subscription.payment_gateway || "");
    badges.push(
      <span
        key="payment"
        className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full border ${
          payB.color
        } ${compact ? "gap-0.5" : "gap-1"}`}
      >
        <CreditCard className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
        {!compact && payB.txt}
      </span>
    );

    // No discount badge (yellow) when there's no discount
    if (!hasDiscount) {
      badges.push(
        <span
          key="no-discount"
          className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 ${
            compact ? "gap-0.5" : "gap-1"
          }`}
        >
          <AlertTriangle className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
          {!compact && "No Discount"}
        </span>
      );
    }

    return badges;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
                <Spinner parentHeight="100%" />
              </div>
            )}

            {/* Back Button */}
            <div className="mb-4">
              <Button
                variant="outline"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Link href="/account" className="flex items-center">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Account
                </Link>
              </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <PageTitle title="All Subscriptions" />
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                    Manage and analyze all subscription data
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            {analyticsData && (
              <Tabs defaultValue="subscriptions" className="mb-8">
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
                              Avg Revenue/Sub
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              ₹
                              {Math.round(
                                analyticsData.avgRevenuePerSub
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              This Month
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {analyticsData.monthlyStats[
                                analyticsData.monthlyStats.length - 1
                              ]?.subscriptions || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                        <CardDescription>
                          Distribution of subscription statuses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
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
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>
                          Subscription growth over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
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
                                dataKey="subscriptions"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Subscriptions"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Revenue Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                        <CardDescription>
                          Revenue trends by month
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
                                formatter={(value: number) => [
                                  `₹${value.toLocaleString()}`,
                                  "Revenue",
                                ]}
                              />
                              <Bar
                                dataKey="revenue"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Plan Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Plan Performance</CardTitle>
                        <CardDescription>
                          Subscriptions by plan type
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData.planStats
                            .slice(0, 5)
                            .map((plan: any, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-slate-100">
                                    {plan.name}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {plan.count} subscriptions
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                                    ₹{plan.revenue.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    ₹
                                    {Math.round(
                                      plan.revenue / plan.count
                                    ).toLocaleString()}{" "}
                                    avg
                                  </div>
                                </div>
                              </div>
                            ))}
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

                    {/* Results Summary */}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {filteredAndSortedSubscriptions.length} of{" "}
                      {subscriptions.length} subscriptions
                    </div>
                  </div>

                  {/* No Subscriptions Found */}
                  {!subscriptions.length && !loading && (
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
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
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("all");
                            setSelectedMonth("");
                          }}
                          className="mt-4"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}

                  {/* Subscriptions List */}
                  {filteredAndSortedSubscriptions.length > 0 && !loading && (
                    <>
                      {/* Desktop View - Enhanced Table */}
                      <div className="hidden lg:block">
                        <Card className="overflow-hidden shadow-lg border-slate-200 dark:border-slate-700">
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs sm:text-sm">
                              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    ID
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Customer
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Plan
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Amount
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Period
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Payment ID
                                  </th>
                                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredAndSortedSubscriptions.map((s) => {
                                  const statusB = statusBadge(s);
                                  const payB = paymentBadge(
                                    s.payment_gateway || ""
                                  );
                                  const hasDiscount =
                                    s.discount_amount && s.discount_amount > 0;

                                  return (
                                    <tr
                                      key={s.id}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200"
                                    >
                                      {/* ID */}
                                      <td className="px-4 py-4">
                                        <div className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md border">
                                          #{s.id}
                                        </div>
                                      </td>

                                      {/* Customer */}
                                      <td className="px-4 py-4">
                                        <div className="flex items-center">
                                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-white">
                                              {s.user?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                            </span>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                              {s.user?.name || "Unknown User"}
                                            </div>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Plan */}
                                      <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                          {s.plan?.name || "—"}
                                        </div>
                                      </td>

                                      {/* Amount */}
                                      <td className="px-4 py-4">
                                        <div className="space-y-1">
                                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            ₹{s.amount.toLocaleString()}
                                          </div>
                                          {hasDiscount ? (
                                            <div className="flex items-center space-x-1">
                                              <Tag className="h-3 w-3 text-green-600" />
                                              <span className="text-xs text-green-600 font-medium">
                                                -₹
                                                {s.discount_amount?.toLocaleString()}
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center space-x-1">
                                              <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                              <span className="text-xs text-yellow-600 font-medium">
                                                No Discount
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      {/* Period */}
                                      <td className="px-4 py-4">
                                        <div className="space-y-1">
                                          <div className="text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-medium">
                                              Start:
                                            </span>{" "}
                                            {dayjs(s.start_date).format(
                                              "DD MMM YY"
                                            )}
                                          </div>
                                          <div className="text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-medium">
                                              End:
                                            </span>{" "}
                                            {dayjs(s.end_date).format(
                                              "DD MMM YY"
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Status */}
                                      <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                          {getStatusAndTypeBadges(s)}
                                        </div>
                                      </td>

                                      {/* Payment ID */}
                                      <td className="px-4 py-4">
                                        <div className="flex items-center space-x-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-md border truncate">
                                              {s.payment_id || "—"}
                                            </div>
                                          </div>
                                          {s.payment_id && (
                                            <TooltipComponent>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md"
                                                  onClick={() =>
                                                    copyPaymentId(
                                                      s.payment_id || ""
                                                    )
                                                  }
                                                >
                                                  {copiedPaymentId ===
                                                  s.payment_id ? (
                                                    <Check className="h-3 w-3 text-green-600" />
                                                  ) : (
                                                    <Copy className="h-3 w-3 text-slate-500" />
                                                  )}
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Copy Payment ID</p>
                                              </TooltipContent>
                                            </TooltipComponent>
                                          )}
                                        </div>
                                      </td>

                                      {/* Actions */}
                                      <td className="px-4 py-4">
                                        <DropdownMenu
                                          open={
                                            openDropdownId === s.id?.toString()
                                          }
                                          onOpenChange={(open) =>
                                            handleDropdownOpenChange(
                                              s.id?.toString() || "",
                                              open
                                            )
                                          }
                                        >
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md"
                                            >
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            align="end"
                                            className="w-36"
                                          >
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubscriptionClick(s);
                                              }}
                                              className="text-xs"
                                            >
                                              <Eye className="h-3 w-3 mr-2" />
                                              View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => removeSub(s.id)}
                                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </div>

                      {/* Mobile View - Optimized Card Layout */}
                      <div className="lg:hidden space-y-3">
                        {filteredAndSortedSubscriptions.map((subscription) => {
                          const hasDiscount =
                            subscription.discount_amount &&
                            subscription.discount_amount > 0;

                          return (
                            <div
                              key={subscription.id}
                              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              onClick={() =>
                                handleSubscriptionClick(subscription)
                              }
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-sm font-bold text-white">
                                        {subscription.user?.name
                                          ?.charAt(0)
                                          ?.toUpperCase() || "?"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {subscription.plan?.name ||
                                        "Unknown Plan"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {subscription.user?.name ||
                                        `Subscription #${subscription.id}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <div className="flex flex-wrap gap-1">
                                    {getStatusAndTypeBadges(subscription, true)}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-slate-400 ml-1" />
                                </div>
                              </div>

                              {/* Amount and Period */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <IndianRupee className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                      ₹{subscription.amount.toLocaleString()}
                                    </span>
                                    {hasDiscount ? (
                                      <div className="flex items-center space-x-1 mt-1">
                                        <Tag className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">
                                          -₹
                                          {subscription.discount_amount?.toLocaleString()}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1 mt-1">
                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                        <span className="text-xs text-yellow-600 font-medium">
                                          No Discount
                                        </span>
                                      </div>
                                    )}
                                  </div>
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
                                    Purchased{" "}
                                    {dayjs(subscription.created_at).format(
                                      "MMM DD, YY"
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Payment ID */}
                              {subscription.payment_id && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Payment ID:
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border max-w-24 truncate">
                                      {subscription.payment_id}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyPaymentId(
                                          subscription.payment_id || ""
                                        );
                                      }}
                                    >
                                      {copiedPaymentId ===
                                      subscription.payment_id ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Compact Subscription Detail Modal */}
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
                    <Package className="h-4 w-4 mr-2" />
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
                          selectedSubscription.discount_amount > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Discount: -₹
                                {selectedSubscription.discount_amount.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs text-yellow-600 font-medium">
                                No Discount Applied
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
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            Status & Payment
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getStatusAndTypeBadges(selectedSubscription)}
                        </div>
                      </div>
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

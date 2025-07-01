"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getAllSubscriptionsOfUser } from "@/actions/subscriptions";
import PageTitle from "@/components/ui/page-title";
import usersGlobalStore, {
  IUsersGlobalStore,
} from "@/global-store/users-store";
import { ISubscription } from "@/interfaces";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp, 
  Banknote, 
  CreditCard,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { generatePDFInvoice } from "../../_utils/pdf-generator";

type SortField = "id" | "created_at" | "start_date" | "end_date" | "plan" | "amount" | "payment_id";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "active" | "expired" | "expiring";

function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const { user } = usersGlobalStore() as IUsersGlobalStore;

  const columns = [
    { key: "id", label: "ID" },
    { key: "created_at", label: "Purchase Date" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Amount" },
    { key: "payment_id", label: "Payment ID" },
  ];

  const getData = async () => {
    if (!user?.id) {
      console.log("User not loaded yet, skipping API call");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response: any = await getAllSubscriptionsOfUser(user.id);
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
  }, [user?.id]);

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
      <ArrowDown size={14} className="ml-1 text-slate-600 dark:text-slate-400" />
    );
  };

  const getSubscriptionStatus = (subscription: ISubscription) => {
    const now = dayjs();
    const endDate = dayjs(subscription.end_date);
    const daysRemaining = endDate.diff(now, 'day');

    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 7) return 'expiring';
    return 'active';
  };

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((subscription) => {
      const matchesSearch = 
        subscription.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.id?.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      if (filterStatus === "all") return true;
      
      const status = getSubscriptionStatus(subscription);
      return status === filterStatus;
    });

    return filtered.sort((a, b) => {
      if (sortField === "plan") {
        return sortDirection === "asc"
          ? (a.plan?.name || "").localeCompare(b.plan?.name || "")
          : (b.plan?.name || "").localeCompare(a.plan?.name || "");
      } else if (["created_at", "start_date", "end_date"].includes(sortField)) {
        return sortDirection === "asc"
          ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
          : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
      } else {
        if (sortField === "amount") {
          return sortDirection === "asc"
            ? a[sortField] - b[sortField]
            : b[sortField] - a[sortField];
        }
        return sortDirection === "asc"
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      }
    });
  }, [subscriptions, sortField, sortDirection, searchTerm, filterStatus]);

  const downloadInvoice = async (subscription: ISubscription) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(subscription.id.toString()));
      
      const invoiceData = {
        subscriptionId: subscription.id?.toString() || "N/A",
        planName: subscription.plan?.name || "Unknown Plan",
        amount: subscription.amount,
        startDate: dayjs(subscription.start_date).format("MMM DD, YYYY"),
        endDate: dayjs(subscription.end_date).format("MMM DD, YYYY"),
        purchaseDate: dayjs(subscription.created_at).format("MMM DD, YYYY"),
        paymentId: subscription.payment_id,
        duration: subscription.total_duration,
        customerName: user?.name || "Unknown Customer",
        customerEmail: user?.email || "No email provided",
        paymentGateway: subscription.payment_gateway || "razorpay"
      };

      await generatePDFInvoice(invoiceData);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
      console.error("Invoice download error:", error);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscription.id.toString());
        return newSet;
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (subscription: ISubscription) => {
    const status = getSubscriptionStatus(subscription);
    const now = dayjs();
    const endDate = dayjs(subscription.end_date);
    const daysRemaining = endDate.diff(now, 'day');

    switch (status) {
      case 'expired':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </span>
        );
      case 'expiring':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {daysRemaining} days left
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
    }
  };

  if (!user?.id && loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle title="My Subscriptions" />
          <div className="mt-8">
            <Spinner parentHeight="300px" />
          </div>
        </div>
      </div>
    );
  }

  if (!user?.id && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageTitle title="My Subscriptions" />
          <div className="mt-8 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Unable to load user information. Please try refreshing the page.
            </p>
            <Button 
              className="mt-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <Package className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <PageTitle title="My Subscriptions" />
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                View and manage all your subscription history
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
            <Spinner parentHeight="100%" />
          </div>
        )}

        {/* Header Actions */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <Button 
            variant="outline" 
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Link href="/account" className="flex items-center">
              <ArrowLeft size={16} className="mr-2" /> Back to Account
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        {subscriptions.length > 0 && !loading && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sort by:
            </span>
            {columns.map((column) => (
              <button
                key={column.key}
                onClick={() => handleSort(column.key as SortField)}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-all duration-200 ${
                  sortField === column.key
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                }`}
              >
                {column.label}
                {renderSortIcon(column.key)}
              </button>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {subscriptions.length > 0 && (
          <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredAndSortedSubscriptions.length} of {subscriptions.length} subscriptions
          </div>
        )}

        {/* No Subscriptions */}
        {!subscriptions.length && !loading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Subscriptions Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have any subscriptions at the moment. Start by choosing a plan that fits your needs.
            </p>
            <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900">
              <Link href="/account/user/purchase-plan" className="flex items-center">
                <CreditCard size={16} className="mr-2" />
                View Subscription Plans
              </Link>
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {subscriptions.length > 0 && !filteredAndSortedSubscriptions.length && !loading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Results Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No subscriptions match your current search and filter criteria.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="border-slate-300 dark:border-slate-600"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Subscriptions Grid */}
        {filteredAndSortedSubscriptions.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {subscription.plan?.name || "Subscription"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {subscription.id}
                      </p>
                    </div>
                    {getStatusBadge(subscription)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Start
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {dayjs(subscription.start_date).format("MMM DD, YYYY")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          End
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {dayjs(subscription.end_date).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Duration
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {subscription.total_duration} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Amount
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Rs. {subscription.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2">
                      {subscription.payment_id?.startsWith('CASH_') ? (
                        <>
                          <Banknote className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Cash Payment
                          </span>
                          {subscription.is_cash_approval ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                              Pending
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Card Payment
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment ID */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Payment ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-mono max-w-[120px] truncate cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        title={subscription.payment_id}
                        onClick={() => copyToClipboard(subscription.payment_id || "", "Payment ID")}
                      >
                        {subscription.payment_id}
                      </span>
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        onClick={() => copyToClipboard(subscription.payment_id || "", "Payment ID")}
                        title="Copy to clipboard"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Purchased on {dayjs(subscription.created_at).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <Button
                    onClick={() => downloadInvoice(subscription)}
                    disabled={downloadingIds.has(subscription.id.toString())}
                    variant="outline"
                    className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {downloadingIds.has(subscription.id.toString()) ? (
                      <>
                        <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" />
                        Download Invoice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSubscriptionsPage;

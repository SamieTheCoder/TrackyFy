"use client";

import React, { useEffect, useState } from "react";
import PageTitle from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllPendingCashPayments,
  approveCashPayment,
  rejectCashPayment,
} from "@/actions/cash-payments";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Spinner from "@/components/ui/spinner";
import {
  Check,
  X,
  User,
  Package,
  Calendar,
  IndianRupee,
  Clock,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

interface ICashPaymentRequest {
  id: number;
  created_at: string;
  start_date: string;
  end_date: string;
  amount: number;
  total_duration: number;
  payment_id: string;
  plan: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
}

type FilterType = "all" | "recent" | "high-value" | "long-duration";

function CashApprovalPage() {
  const [requests, setRequests] = useState<ICashPaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    ICashPaymentRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ICashPaymentRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllPendingCashPayments();
      if (response.success) {
        setRequests(response.data || []);
        setFilteredRequests(response.data || []);
      } else {
        toast.error("Failed to fetch cash payment requests");
      }
    } catch (error) {
      toast.error("Error loading requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = requests.filter((request) => {
      // Search filter
      const matchesSearch =
        request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      // Type filter
      switch (filterType) {
        case "recent":
          return dayjs().diff(dayjs(request.created_at), "hours") <= 24;
        case "high-value":
          return request.amount >= 5000;
        case "long-duration":
          return request.total_duration >= 180;
        default:
          return true;
      }
    });

    setFilteredRequests(filtered);
  }, [requests, searchTerm, filterType]);

  const handleAction = (
    request: ICashPaymentRequest,
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingIds((prev) => new Set(prev).add(selectedRequest.id));

      const response =
        actionType === "approve"
          ? await approveCashPayment(selectedRequest.id)
          : await rejectCashPayment(selectedRequest.id);

      if (response.success) {
        toast.success(response.message);
        setRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );
        setFilteredRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} payment`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
      setShowConfirmDialog(false);
      setSelectedRequest(null);
    }
  };

  const exportData = () => {
    const csvData = [
      [
        "Request ID",
        "Customer Name",
        "Email",
        "Plan",
        "Amount",
        "Duration",
        "Submitted Date",
      ],
      ...filteredRequests.map((request) => [
        request.id,
        request.user?.name || "Unknown",
        request.user?.email || "No email",
        request.plan?.name || "Unknown Plan",
        request.amount,
        `${request.total_duration} days`,
        dayjs(request.created_at).format("YYYY-MM-DD HH:mm:ss"),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cash-payment-requests-${dayjs().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getUrgencyBadge = (request: ICashPaymentRequest) => {
    const hoursAgo = dayjs().diff(dayjs(request.created_at), "hours");

    if (hoursAgo <= 2) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          Urgent
        </span>
      );
    } else if (hoursAgo <= 24) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          Recent
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
              <Spinner parentHeight="100%" />
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <PageTitle title="Cash Payment Approvals" />
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                  Review and approve cash payment requests from customers
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Pending
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {requests.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ₹
                    {requests
                      .reduce((sum, req) => sum + req.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Recent (24h)
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {
                      requests.filter(
                        (req) =>
                          dayjs().diff(dayjs(req.created_at), "hours") <= 24
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    High Value
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {requests.filter((req) => req.amount >= 5000).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 space-y-4">
            {/* Top Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <Button
                variant="outline"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
              >
                <Link href="/account" className="flex items-center">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Account
                </Link>
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={fetchRequests}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by customer name, email, plan, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                >
                  <option value="all">All Requests</option>
                  <option value="recent">Recent (24h)</option>
                  <option value="high-value">High Value (≥₹5000)</option>
                  <option value="long-duration">
                    Long Duration (≥180 days)
                  </option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredRequests.length} of {requests.length} requests
            </div>
          </div>

          {/* No Requests */}
          {!requests.length && !loading && (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Pending Requests
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                All cash payment requests have been processed.
              </p>
            </div>
          )}

          {/* No Search Results */}
          {requests.length > 0 && !filteredRequests.length && !loading && (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Results Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No requests match your current search and filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Requests Grid */}
          {filteredRequests.length > 0 && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                          Request #{request.id}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {dayjs(request.created_at).format(
                            "MMM DD, YYYY [at] HH:mm"
                          )}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {dayjs(request.created_at).fromNow()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getUrgencyBadge(request)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <User className="h-4 w-4 mr-2" />
                          <span className="text-sm">Customer</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {request.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {request.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Package className="h-4 w-4 mr-2" />
                          <span className="text-sm">Plan</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {request.plan?.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">Duration</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {request.total_duration} days
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">Period</span>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {dayjs(request.start_date).format("MMM DD")} -{" "}
                          {dayjs(request.end_date).format("MMM DD, YYYY")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <IndianRupee className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Amount</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ₹{request.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAction(request, "reject")}
                        disabled={processingIds.has(request.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {processingIds.has(request.id) ? (
                          <>
                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleAction(request, "approve")}
                        disabled={processingIds.has(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingIds.has(request.id) ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Payment Request Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Request ID:
                    </span>
                    <p className="font-medium">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Amount:
                    </span>
                    <p className="font-medium text-orange-600">
                      ₹{selectedRequest.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Customer:
                    </span>
                    <p className="font-medium">{selectedRequest.user?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Plan:
                    </span>
                    <p className="font-medium">{selectedRequest.plan?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Duration:
                    </span>
                    <p className="font-medium">
                      {selectedRequest.total_duration} days
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Submitted:
                    </span>
                    <p className="font-medium">
                      {dayjs(selectedRequest.created_at).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Email:
                  </span>
                  <p className="font-medium">{selectedRequest.user?.email}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Period:
                  </span>
                  <p className="font-medium">
                    {dayjs(selectedRequest.start_date).format("MMM DD, YYYY")} -{" "}
                    {dayjs(selectedRequest.end_date).format("MMM DD, YYYY")}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle
                className={`flex items-center ${
                  actionType === "approve" ? "text-green-600" : "text-red-600"
                }`}
              >
                {actionType === "approve" ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                {actionType === "approve" ? "Approve" : "Reject"} Payment
                Request
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <div className="space-y-2">
                    <div>
                      Are you sure you want to {actionType} this payment
                      request?
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mt-3">
                      <div className="text-sm">
                        <strong>Customer:</strong> {selectedRequest.user?.name}
                      </div>
                      <div className="text-sm">
                        <strong>Amount:</strong> ₹
                        {selectedRequest.amount.toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <strong>Plan:</strong> {selectedRequest.plan?.name}
                      </div>
                    </div>
                    {actionType === "approve" && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                        This will activate the customer's subscription
                        immediately.
                      </div>
                    )}
                    {actionType === "reject" && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                        This will permanently delete the payment request.
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                className={
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {actionType === "approve" ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CashApprovalPage;

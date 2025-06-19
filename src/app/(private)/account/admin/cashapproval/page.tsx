"use client";

import React, { useEffect, useState } from "react";
import PageTitle from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import {
  getAllPendingCashPayments,
  approveCashPayment,
  rejectCashPayment,
} from "@/actions/cash-payments";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Spinner from "@/components/ui/spinner";
import {
  Check,
  X,
  User,
  Package,
  Calendar,
  DollarSign,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

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

function CashApprovalPage() {
  const [requests, setRequests] = useState<ICashPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

const fetchRequests = async () => {
  try {
    setLoading(true);
    const response = await getAllPendingCashPayments();
    if (response.success) {
      // Fix: Ensure response.data is always an array
      setRequests(response.data || []);
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

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(requestId));
      const response = await approveCashPayment(requestId);
      
      if (response.success) {
        toast.success(response.message);
        setRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to approve payment");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(requestId));
      const response = await rejectCashPayment(requestId);
      
      if (response.success) {
        toast.success(response.message);
        setRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to reject payment");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  return (
    <div className="relative">
      <PageTitle title="Cash Payment Approvals" />

      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
          <Spinner parentHeight="100%" />
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <Button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center">
          <Link href="/account" className="flex items-center">
            <ArrowLeft size={16} className="mr-2" /> Back to Account
          </Link>
        </Button>

        <Button
          onClick={fetchRequests}
          disabled={loading}
          className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {!requests.length && !loading && (
        <div className="col-span-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
              No Pending Requests
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              All cash payment requests have been processed.
            </p>
          </div>
        </div>
      )}

      {requests.length > 0 && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500"></div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                      Payment Request #{request.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted {dayjs(request.created_at).format("MMM DD, YYYY [at] HH:mm")}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">Customer</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {request.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Package className="h-4 w-4 mr-2" />
                      <span className="text-sm">Plan</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {request.plan?.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {request.total_duration} days
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Period</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {dayjs(request.start_date).format("MMM DD")} - {dayjs(request.end_date).format("MMM DD, YYYY")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Amount</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      ₹{request.amount}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReject(request.id)}
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
                    onClick={() => handleApprove(request.id)}
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
  );
}

export default CashApprovalPage;

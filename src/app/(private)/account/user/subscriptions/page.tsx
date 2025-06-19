"use client";
import React, { useEffect, useState } from "react";
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
import { ArrowLeft, ArrowUpDown, ArrowDown, ArrowUp, Banknote, CreditCard } from "lucide-react";
import Link from "next/link";

type SortField =
  | "id"
  | "created_at"
  | "start_date"
  | "end_date"
  | "plan"
  | "amount"
  | "payment_id";
type SortDirection = "asc" | "desc";

function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { user } = usersGlobalStore() as IUsersGlobalStore;

  const columns = [
    { key: "id", label: "Subscription ID" },
    { key: "created_at", label: "Purchase Date" },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Amount" },
    { key: "payment_id", label: "Payment ID" },
  ];

  const getData = async () => {
    try {
      setLoading(true);
      const response: any = await getAllSubscriptionsOfUser(user?.id!);
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
      <ArrowUp size={14} className="ml-1 text-orange-500" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-orange-500" />
    );
  };

  const sortedSubscriptions = React.useMemo(() => {
    return [...subscriptions].sort((a, b) => {
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
  }, [subscriptions, sortField, sortDirection]);

  return (
    <div className="relative">
      <PageTitle title="My Subscriptions" />

      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 z-20 backdrop-blur-sm rounded-xl">
          <Spinner parentHeight="100%" />
        </div>
      )}

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center">
          <Link href="/account" className="flex items-center">
            <ArrowLeft size={16} className="mr-2" /> Back to Account
          </Link>
        </Button>

        {subscriptions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </span>
            {columns.map((column) => (
              <button
                key={column.key}
                onClick={() => handleSort(column.key as SortField)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center transition-colors ${
                  sortField === column.key
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {column.label}
                {renderSortIcon(column.key)}
              </button>
            ))}
          </div>
        )}
      </div>

      {!subscriptions.length && !loading && (
        <div className="col-span-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You do not have any subscription at the moment.
          </p>
          <Button className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            <Link href="/account/user/purchase-plan">
              View Subscription Plans
            </Link>
          </Button>
        </div>
      )}

      {subscriptions.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {subscription.plan?.name || "Subscription"}
                  </h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    ID: {subscription.id}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Purchase Date
                    </span>
                    <span className="font-medium">
                      {dayjs(subscription.created_at).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Start Date
                    </span>
                    <span className="font-medium">
                      {dayjs(subscription.start_date).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      End Date
                    </span>
                    <span className="font-medium">
                      {dayjs(subscription.end_date).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Amount
                    </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      ₹{subscription.amount}
                    </span>
                  </div>
                  
                  {/* Payment Method Section */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2">
                      {subscription.payment_id?.startsWith('CASH_') ? (
                        <>
                          <Banknote className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-600 dark:text-green-400">
                            Cash Payment
                          </span>
                          {subscription.is_cash_approval ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                              Pending
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            Card Payment
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Payment ID
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="font-medium max-w-[120px] truncate text-right cursor-pointer hover:text-orange-500 transition-colors"
                        title={subscription.payment_id}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            subscription.payment_id || ""
                          );
                          toast.success("Payment ID copied to clipboard");
                        }}
                      >
                        {subscription.payment_id}
                      </span>
                      <button
                        className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            subscription.payment_id || ""
                          );
                          toast.success("Payment ID copied to clipboard");
                        }}
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
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Duration: {subscription.total_duration} days
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSubscriptionsPage;

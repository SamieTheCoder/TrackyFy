"use client";
import React, { useState, useMemo } from "react";
import { IPlan } from "@/interfaces";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp, 
  Plus, 
  Search,
  Crown,
  Package,
  BadgeCheck,
  Flame,
  IndianRupee,
  Dot,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { deletePlanById } from "@/actions/plans";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/ui/page-title";

type SortField = "name" | "monthly_price" | "quarterly_price" | "half_yearly_price" | "yearly_price" | "created_at" | "popular";
type SortDirection = "asc" | "desc";

function PlansTable({ plans }: { plans: IPlan[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("monthly_price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    { key: "name", label: "Name" },
    { key: "monthly_price", label: "Monthly" },
    { key: "quarterly_price", label: "Quarterly" },
    { key: "half_yearly_price", label: "Half Yearly" },
    { key: "yearly_price", label: "Yearly" },
    { key: "popular", label: "Popular" },
    { key: "created_at", label: "Created" },
  ];

  const filteredAndSortedPlans = useMemo(() => {
    // First filter plans by search query
    const filtered = plans.filter(plan => 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then sort the filtered plans
    return [...filtered].sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortField === "popular") {
        return sortDirection === "asc"
          ? (a.popular ? 1 : -1) - (b.popular ? 1 : -1)
          : (b.popular ? 1 : -1) - (a.popular ? 1 : -1);
      } else {
        return sortDirection === "asc"
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }
    });
  }, [plans, sortField, sortDirection, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      setDeletingPlanId(id);

      const response = await deletePlanById(id);

      if (response.success) {
        toast.success(response.message);
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while deleting the plan");
    } finally {
      setLoading(false);
      setDeletingPlanId(null);
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-orange-500" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-orange-500" />
    );
  };

  const getSavingsPercentage = (plan: IPlan) => {
    const monthlyCost = plan.monthly_price * 12;
    const yearlyCost = plan.yearly_price;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
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
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <PageTitle title="Subscription Plans" />
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                  Manage and configure all available subscription plans
                </p>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search plans by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</span>
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

              {/* Add New Button */}
              <Button 
                onClick={() => router.push('/account/admin/plans/add')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center"
                disabled={loading}
              >
                <Plus size={16} className="mr-2" /> Add New Plan
              </Button>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredAndSortedPlans.length} of {plans.length} plans
            </div>
          </div>

          {/* Plans Grid */}
          {filteredAndSortedPlans.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No Plans Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {searchQuery 
                  ? `No plans match "${searchQuery}"` 
                  : "Create your first subscription plan to get started"}
              </p>
              <Button 
                onClick={() => router.push('/account/admin/plans/add')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <Plus size={16} className="mr-2" /> Create New Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 ${
                    deletingPlanId === plan.id ? "opacity-50" : ""
                  }`}
                >
                  
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        Popular
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                          {plan.name}
                          {plan.popular && (
                            <Crown className="h-5 w-5 text-amber-500 ml-2" />
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {plan.description || "No description available"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/account/admin/plans/edit/${plan.id}`)}
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 dark:text-slate-400 hover:text-orange-500"
                          disabled={loading}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(plan.id)}
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 dark:text-slate-400 hover:text-red-500"
                          disabled={loading}
                        >
                          {loading && deletingPlanId === plan.id ? (
                            <Spinner parentHeight={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pricing Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 mb-1">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="text-sm">Monthly</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          ₹{plan.monthly_price}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 mb-1">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="text-sm">Quarterly</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          ₹{plan.quarterly_price}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 mb-1">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="text-sm">Half Yearly</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          ₹{plan.half_yearly_price}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center text-orange-700 dark:text-orange-400 mb-1">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="text-sm">Yearly</span>
                        </div>
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ₹{plan.yearly_price}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Save {getSavingsPercentage(plan)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center">
                        <BadgeCheck className="h-4 w-4 mr-2 text-green-500" />
                        Features
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            +{plan.features.length - 4} more features
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Created {dayjs(plan.created_at).format("MMM DD, YYYY")}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        plan.is_active 
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      }`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlansTable;

"use client";
import React, { useState, useMemo } from "react";
import { getAllPlans } from "@/actions/plans";
import PageTitle from "@/components/ui/page-title";
import Spinner from "@/components/ui/spinner";
import { IPlan } from "@/interfaces";
import {
  IPlansGlobalStore,
  plansGlobalStore,
} from "@/global-store/plans-store";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ChevronRight, 
  ArrowUpDown,  
  Crown, 
  Zap,
  TrendingUp,
  ArrowLeft,
  Filter,
  Search,
  FolderKanban,
  HelpCircle,
  BadgeCheck,
  IndianRupee,
  Flame
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define color scheme type
type ColorScheme = {
  accent: string;
  border: string;
  bg: string;
  text: string;
  highlight: string;
  gradient: string;
};

// Define plan colors type with specific keys
type PlanColorType = {
  basic: ColorScheme;
  standard: ColorScheme;
  premium: ColorScheme;
  enterprise: ColorScheme;
  default: ColorScheme;
};

// Define sort options
type SortOption = "name" | "price" | "popularity" | "features";

function PurchasePlanPage() {
  const { selectedPaymentPlan, setSelectedPaymentPlan } =
    plansGlobalStore() as IPlansGlobalStore;

  const [plans, setPlans] = useState<IPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [contactSupportLoading, setContactSupportLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all");
  
  const router = useRouter();
  
  // Enhanced color scheme for different plan types
  const planColors: PlanColorType = {
    basic: {
      accent: "from-blue-500 to-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      highlight: "bg-blue-100 dark:bg-blue-800/30",
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
    },
    standard: {
      accent: "from-purple-500 to-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      highlight: "bg-purple-100 dark:bg-purple-800/30",
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
    },
    premium: {
      accent: "from-orange-500 to-orange-600",
      border: "border-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      highlight: "bg-orange-100 dark:bg-orange-800/30",
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
    },
    enterprise: {
      accent: "from-emerald-500 to-emerald-600",
      border: "border-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      highlight: "bg-emerald-100 dark:bg-emerald-800/30",
      gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20"
    },
    default: {
      accent: "from-slate-500 to-slate-600",
      border: "border-slate-500",
      bg: "bg-slate-50 dark:bg-slate-900/20",
      text: "text-slate-600 dark:text-slate-400",
      highlight: "bg-slate-100 dark:bg-slate-800/30",
      gradient: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20"
    }
  };

  // Function to determine color scheme based on plan name
  const getPlanColorScheme = (planName: string): ColorScheme => {
    const name = planName.toLowerCase();
    if (name.includes('basic')) return planColors.basic;
    if (name.includes('standard')) return planColors.standard;
    if (name.includes('premium')) return planColors.premium;
    if (name.includes('enterprise')) return planColors.enterprise;
    
    // Default to a color based on index in the array
    const index = plans.findIndex(p => p.name === planName) % 4;
    const colorKeys = Object.keys(planColors) as Array<keyof PlanColorType>;
    return planColors[colorKeys[index]] || planColors.default;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await getAllPlans();
      if (!response.success) {
        throw new Error(response.message);
      }
      setPlans(response.data);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentsPlans = (plan: IPlan) => {
    return [
      {
        planName: "Monthly",
        price: plan.monthly_price,
        key: "monthly_price",
        duration: 30,
        popular: false,
      },
      {
        planName: "Quarterly",
        price: plan.quarterly_price,
        key: "quarterly_price",
        duration: 90,
        popular: true,
        savings: Math.round(
          (1 - plan.quarterly_price / (plan.monthly_price * 3)) * 100
        ),
      },
      {
        planName: "Half Yearly",
        price: plan.half_yearly_price,
        key: "half_yearly_price",
        duration: 180,
        popular: false,
        savings: Math.round(
          (1 - plan.half_yearly_price / (plan.monthly_price * 6)) * 100
        ),
      },
      {
        planName: "Yearly",
        price: plan.yearly_price,
        key: "yearly_price",
        duration: 365,
        popular: false,
        savings: Math.round(
          (1 - plan.yearly_price / (plan.monthly_price * 12)) * 100
        ),
      },
    ];
  };

  const getSavingsPercentage = (plan: IPlan) => {
    const monthlyCost = plan.monthly_price * 12;
    const yearlyCost = plan.yearly_price;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handleCheckout = () => {
    if (!selectedPaymentPlan?.paymentPlan) {
      toast.error("Please select a payment plan first");
      return;
    }
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      router.push("/account/user/purchase-plan/checkout");
    }, 1000);
  };

  // Handle Contact Support with loading
  const handleContactSupport = async () => {
    setContactSupportLoading(true);
    
    try {
      // Simulate async operation (replace with actual contact support logic)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to contact page or open support modal
      router.push("/contact");
      
      // Or you could show a success message
      // toast.success("Redirecting to support...");
    } catch (error) {
      toast.error("Failed to open support. Please try again.");
    } finally {
      setContactSupportLoading(false);
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plans.filter((plan) => {
      // Search filter
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Price filter
      if (priceFilter !== "all") {
        const monthlyPrice = plan.monthly_price;
        switch (priceFilter) {
          case "low":
            return monthlyPrice < 1000;
          case "medium":
            return monthlyPrice >= 1000 && monthlyPrice < 3000;
          case "high":
            return monthlyPrice >= 3000;
        }
      }

      return true;
    });

    // Sort plans
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.monthly_price - b.monthly_price;
        case "features":
          return (b.features?.length || 0) - (a.features?.length || 0);
        case "popularity":
          // Assuming popular plans have a 'popular' property
          const aPopular = (a as any).popular ? 1 : 0;
          const bPopular = (b as any).popular ? 1 : 0;
          return bPopular - aPopular;
        default:
          return 0;
      }
    });
  }, [plans, sortBy, searchTerm, priceFilter]);

  // Handle pricing card click
  const handlePricingCardClick = (plan: IPlan, paymentPlan: any) => {
    setSelectedPaymentPlan({
      mainPlan: plan,
      paymentPlan: paymentPlan,
    });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header - Reduced padding for mobile */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <PageTitle title="Choose Your Plan" />
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Select the plan that best fits your needs. All plans include access to our core features.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-10">
            <Spinner parentHeight="400px" />
          </div>
        ) : (
          <>
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Link href="/account" className="flex items-center">
                  <ArrowLeft size={16} className="mr-2" /> Back to Account
                </Link>
              </Button>
            </div>

            {/* Filters and Search - Reduced spacing for mobile */}
            <div className="mb-6 space-y-3">
              {/* Search and Price Filter */}
              <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                {/* Price Filter and Sort in one row on mobile */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  {/* Price Filter - Fixed icon overlap */}
                  <div className="relative">
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value as any)}
                      className="w-full sm:w-48 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                    >
                      <option value="all">All Prices</option>
                      <option value="low">Under ₹1,000</option>
                      <option value="medium">₹1,000 - ₹3,000</option>
                      <option value="high">Above ₹3,000</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                    <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">Sort by:</span>
                    <select 
                      className="text-sm border-0 bg-transparent focus:ring-0 cursor-pointer text-slate-900 dark:text-slate-100 flex-1 sm:flex-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                      <option value="price">Price (Low to High)</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="features">Features (Most to Least)</option>
                      <option value="popularity">Popularity</option>
                    </select>
                    <ArrowUpDown size={14} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {plans.length > 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredAndSortedPlans.length} of {plans.length} plans
                </div>
              )}
            </div>

            {/* No Plans Found */}
            {filteredAndSortedPlans.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <FolderKanban className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Plans Found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchTerm || priceFilter !== "all" 
                    ? "No plans match your current search and filter criteria."
                    : "No plans are currently available."
                  }
                </p>
                {(searchTerm || priceFilter !== "all") && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setPriceFilter("all");
                    }}
                    className="border-slate-300 dark:border-slate-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}

            {/* Plans Grid - Reduced gap for mobile */}
            {filteredAndSortedPlans.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredAndSortedPlans.map((plan: IPlan, index: number) => {
                  const paymentPlans = getPaymentsPlans(plan);
                  const isSelected = selectedPaymentPlan?.mainPlan?.id === plan.id;
                  const colorScheme = getPlanColorScheme(plan.name);
                  const isPopular = index === 1; // Make second plan popular for demo

                  return (
                    <Card
                      className={`relative flex flex-col h-full transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? `border-2 ${colorScheme.border} shadow-lg transform scale-[1.02] ${colorScheme.gradient}`
                          : "border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg"
                      }`}
                      key={plan.id}
                    >
                      {/* Colored accent bar at the top */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.accent}`}></div>
                      
                      <CardHeader className="pb-3 pt-4 relative">
                        {/* Popular Badge - Now inside the card */}
                        {isPopular && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="flex items-center px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg">
                              <Crown className="h-3 w-3 mr-1" />
                              Popular
                            </div>
                          </div>
                        )}

                        {/* Header - Reduced spacing */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0 pr-16">
                            <CardTitle className={`text-lg font-bold ${isSelected ? colorScheme.text : "text-slate-900 dark:text-slate-100"} truncate`}>
                              {plan.name}
                            </CardTitle>
                            {plan.features && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {plan.features.length} features included
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Description - Reduced height */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 min-h-[30px] mb-3 line-clamp-2">
                          {plan.description}
                        </p>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col pt-0">
                        {/* Clickable Pricing Cards Grid - Reduced spacing */}
                        <div className="mb-4">
                          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Choose Billing Cycle</h2>
                          <div className="grid grid-cols-2 gap-2">
                            {paymentPlans.map((paymentPlan) => {
                              const isCardSelected = isSelected && selectedPaymentPlan?.paymentPlan?.key === paymentPlan.key;
                              const isYearly = paymentPlan.key === "yearly_price";
                              
                              return (
                                <div
                                  key={paymentPlan.key}
                                  onClick={() => handlePricingCardClick(plan, paymentPlan)}
                                  className={`cursor-pointer transition-all duration-200 rounded-lg p-2 border-2 ${
                                    isCardSelected
                                      ? `${colorScheme.border} ${colorScheme.highlight} shadow-md`
                                      : isYearly
                                      ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                                      : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className={`flex items-center ${isYearly ? "text-orange-700 dark:text-orange-400" : "text-slate-600 dark:text-slate-400"}`}>
                                      <IndianRupee className="h-3 w-3 mr-1" />
                                      <span className="text-xs">{paymentPlan.planName}</span>
                                    </div>
                                    {paymentPlan.popular && (
                                      <div className="flex items-center px-1 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                                        <Flame className="h-2 w-2 mr-0.5" />
                                        Hot
                                      </div>
                                    )}
                                  </div>
                                  <div className={`text-sm font-bold ${
                                    isCardSelected 
                                      ? colorScheme.text 
                                      : isYearly 
                                      ? "text-orange-600 dark:text-orange-400" 
                                      : "text-slate-900 dark:text-slate-100"
                                  }`}>
                                    ₹{paymentPlan.price}
                                  </div>
                                  {paymentPlan.savings && paymentPlan.savings > 0 && (
                                    <div className={`text-xs mt-0.5 ${
                                      isYearly 
                                        ? "text-orange-600 dark:text-orange-400" 
                                        : "text-green-600 dark:text-green-400"
                                    }`}>
                                      Save {paymentPlan.savings}%
                                    </div>
                                  )}
                                  {isCardSelected && (
                                    <div className="flex items-center mt-1">
                                      <Check size={10} className={`mr-1 ${colorScheme.text}`} />
                                      <span className={`text-xs ${colorScheme.text}`}>Selected</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Features - Reduced height for mobile */}
                        <div className="flex-grow mb-4">
                          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
                            <BadgeCheck className="h-4 w-4 mr-2 text-green-500" />
                            Features
                          </h2>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {plan.features?.map((feature: string, index: number) => (
                              <div
                                key={index}
                                className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                              >
                                <Check
                                  size={12}
                                  className={`${isSelected ? colorScheme.text : "text-emerald-500"} mt-0.5 flex-shrink-0`}
                                />
                                <span className="text-xs leading-relaxed">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selection Confirmation - Reduced padding */}
                        {isSelected && selectedPaymentPlan?.paymentPlan && (
                          <div className={`text-xs text-center p-2 rounded-lg mb-3 ${colorScheme.bg} border ${colorScheme.border}`}>
                            <span className={colorScheme.text}>
                              ✓ Selected: {selectedPaymentPlan.paymentPlan.planName} plan at ₹{selectedPaymentPlan.paymentPlan.price}
                            </span>
                          </div>
                        )}

                        {/* Action Button - Reduced height for mobile */}
                        <div className="pt-2 mt-auto">
                          <Button
                            className={`w-full h-10 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                              isSelected && selectedPaymentPlan?.paymentPlan
                                ? `bg-gradient-to-r ${colorScheme.accent} text-white hover:opacity-90 shadow-lg`
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                            disabled={
                              !selectedPaymentPlan?.paymentPlan ||
                              selectedPaymentPlan?.mainPlan?.id !== plan.id ||
                              checkoutLoading
                            }
                            onClick={handleCheckout}
                          >
                            {checkoutLoading && isSelected ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                              </>
                            ) : isSelected && selectedPaymentPlan?.paymentPlan ? (
                              <>
                                <Zap size={14} />
                                <span>Proceed to Checkout</span>
                                <ChevronRight size={14} />
                              </>
                            ) : (
                              <>
                                <span>Select Billing Cycle</span>
                                <ChevronRight size={14} />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Help Section - Reduced padding for mobile */}
            <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-slate-600 dark:text-slate-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 dark:text-slate-200">Need Help Choosing?</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto text-sm sm:text-base">
                  If you're not sure which plan is right for you, our team is happy to help you find the perfect fit for your needs. 
                  All plans come with a 30-day money-back guarantee.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleContactSupport}
                    disabled={contactSupportLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 flex items-center justify-center gap-2 px-4 py-2"
                  >
                    {contactSupportLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Contacting Support...</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="h-4 w-4" />
                        <span>Contact Support</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Comparison Hint - Reduced padding */}
            {selectedPaymentPlan?.paymentPlan && (
              <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                      Ready to proceed?
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                      You've selected {selectedPaymentPlan.mainPlan?.name} - {selectedPaymentPlan.paymentPlan.planName} plan
                    </p>
                  </div>
                  <Button 
                    onClick={handleCheckout}
                    className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto h-10"
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Checkout
                        <ChevronRight size={14} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PurchasePlanPage;

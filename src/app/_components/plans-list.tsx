"use client";
import { getAllPlans } from "@/actions/plans";
import { IPlan } from "@/interfaces";
import React, { useEffect, memo, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Check, Loader2, Star, Zap, Crown } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Memoized billing cycle option component
const BillingCycleButton = memo(
  ({
    cycle,
    isSelected,
    onClick,
  }: {
    cycle: { id: string; label: string; discount?: string };
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 min-h-[44px] touch-manipulation ${
        isSelected
          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
          : "text-gray-300 hover:text-white hover:bg-gray-700"
      }`}
    >
      {cycle.label}
      {cycle.discount && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
          {cycle.discount}
        </span>
      )}
    </button>
  )
);

BillingCycleButton.displayName = "BillingCycleButton";

// Plan card component - Cleaned up logging
const PlanCard = memo(
  ({
    plan,
    isPopular,
    price,
    billingLabel,
    onChoosePlan,
  }: {
    plan: IPlan;
    isPopular: boolean;
    price: number;
    billingLabel: string;
    onChoosePlan: () => void;
  }) => (
    <div
      className={`group relative flex flex-col h-full rounded-xl overflow-hidden transition-all duration-500 will-change-transform ${
        isPopular
          ? "border-2 border-orange-500 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl shadow-orange-900/30 hover:scale-105"
          : "border border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm hover:border-orange-500/50 hover:scale-102"
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg">
            <Crown className="mr-1 h-3 w-3" />
            POPULAR
          </Badge>
        </div>
      )}

      {/* Plan image at the absolute top */}
      <div className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden">
        {plan.images && plan.images.length > 0 ? (
          <img
            src={plan.images[0]}
            alt={plan.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // Only log errors, not successful loads
              console.error("❌ Plan image failed to load:", plan.images[0]);

              // Enhanced fallback with TrackyFy branding
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23374151'/%3E%3Ctext x='50%25' y='35%25' font-family='Arial' font-size='20' fill='%23F97316' text-anchor='middle' dy='0.3em'%3E🏋️ TrackyFy%3C/text%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239CA3AF' text-anchor='middle' dy='0.3em'%3EPlan Image%3C/text%3E%3Ctext x='50%25' y='65%25' font-family='Arial' font-size='12' fill='%236B7280' text-anchor='middle' dy='0.3em'%3ENot Available%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div
            className={`h-full w-full flex items-center justify-center ${
              isPopular
                ? "bg-gradient-to-br from-orange-500/20 to-pink-500/20"
                : "bg-gradient-to-br from-gray-700 to-gray-800"
            }`}
          >
            <div className="text-center">
              <Zap
                className={`h-12 w-12 mx-auto mb-2 ${
                  isPopular ? "text-orange-400" : "text-gray-500"
                }`}
              />
              <p className="text-xs text-gray-400">No Image</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Plan name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 text-left">
            {plan.name}
          </h3>
          {isPopular && (
            <div className="flex items-center text-orange-400 text-sm justify-start">
              <Star className="mr-1 h-4 w-4 fill-current" />
              Most Popular Choice
            </div>
          )}
        </div>
      </div>

      {/* Plan content */}
      <div className="flex flex-col flex-grow p-4 sm:p-6">
        {/* Price section */}
        <div className="mb-6 pb-4 border-b border-gray-700/50">
          <div className="flex items-baseline justify-start mb-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              ₹{price}
            </span>
            <span className="ml-2 text-sm text-gray-400">/{billingLabel}</span>
          </div>
          <p className="text-sm text-gray-400 text-left line-clamp-2 leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Features section */}
        <div className="flex-grow mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-start">
            <Check className="mr-2 h-4 w-4 text-orange-500" />
            What's Included
          </h4>
          <ul className="space-y-3">
            {plan.features.slice(0, 6).map((feature, idx) => (
              <li key={idx} className="flex items-start group/feature">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 mt-0.5">
                  <Check className="h-3 w-3 text-orange-500" />
                </div>
                <span className="text-sm text-gray-300 group-hover/feature:text-white transition-colors duration-200 text-left">
                  {feature}
                </span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-sm text-gray-500 italic text-left">
                +{plan.features.length - 6} more features...
              </li>
            )}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onChoosePlan}
          className={`w-full py-3 sm:py-4 font-semibold transition-all duration-300 min-h-[44px] touch-manipulation ${
            isPopular
              ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600 hover:border-orange-500"
          }`}
        >
          {isPopular ? (
            <>
              <Crown className="mr-2 h-4 w-4" />
              Choose Popular Plan
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Get Started
            </>
          )}
        </Button>
      </div>
    </div>
  )
);

PlanCard.displayName = "PlanCard";

// Loading skeleton component
const PlansLoadingSkeleton = memo(() => (
  <div className="space-y-8">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
      <div className="flex space-x-2 p-1 bg-gray-800 rounded-lg">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-20 bg-gray-700 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl animate-pulse border border-gray-700"
        />
      ))}
    </div>
  </div>
));

PlansLoadingSkeleton.displayName = "PlansLoadingSkeleton";

function PlansList() {
  const [plans, setPlans] = React.useState<IPlan[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    React.useState("monthly");
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const billingCycles = useMemo(
    () => [
      { id: "monthly", label: "Monthly" },
      { id: "quarterly", label: "Quarterly", discount: "5%" },
      { id: "half_yearly", label: "Half Yearly", discount: "10%" },
      { id: "yearly", label: "Yearly", discount: "20%" },
    ],
    []
  );

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllPlans();
      if (response.success && response.data) {
        const sortedPlans = response.data.sort(
          (a: IPlan, b: IPlan) => a.monthly_price - b.monthly_price
        );

        setPlans(sortedPlans);
        // Removed success toast - only show errors
      } else {
        setPlans([]);
        toast.error(response.message || "Failed to load plans", {
          position: "top-center",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      toast.error("Error fetching plans", {
        position: "top-center",
        duration: 4000,
      });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const getPriceByBillingCycle = useCallback(
    (plan: IPlan) => {
      switch (selectedBillingCycle) {
        case "monthly":
          return plan.monthly_price;
        case "quarterly":
          return plan.quarterly_price;
        case "half_yearly":
          return plan.half_yearly_price;
        case "yearly":
          return plan.yearly_price;
        default:
          return plan.monthly_price;
      }
    },
    [selectedBillingCycle]
  );

  const getBillingLabel = useCallback(() => {
    switch (selectedBillingCycle) {
      case "monthly":
        return "month";
      case "quarterly":
        return "quarter";
      case "half_yearly":
        return "6 months";
      case "yearly":
        return "year";
      default:
        return "month";
    }
  }, [selectedBillingCycle]);

  const handleChoosePlan = useCallback(() => {
    if (isSignedIn) {
      router.push("/account/user/purchase-plan");
    } else {
      toast.error("Please sign in to choose a plan", {
        duration: 4000,
        position: "top-center",
        icon: "🔒",
      });

      setTimeout(() => {
        router.push("/?form=sign-in");
      }, 1000);
    }
  }, [isSignedIn, router]);

  const handleBillingCycleChange = useCallback((cycleId: string) => {
    setSelectedBillingCycle(cycleId);
  }, []);

  if (loading) {
    return <PlansLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Choose Your Billing Cycle
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Save more with longer commitments
          </p>
        </div>

        <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
          {billingCycles.map((cycle) => (
            <BillingCycleButton
              key={cycle.id}
              cycle={cycle}
              isSelected={selectedBillingCycle === cycle.id}
              onClick={() => handleBillingCycleChange(cycle.id)}
            />
          ))}
        </div>
      </div>

      {plans.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50">
          <CardContent className="text-center py-12">
            <Zap className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Plans Available
            </h3>
            <p className="text-gray-400">
              Check back later for exciting new plans!
            </p>
            <Button
              onClick={fetchPlans}
              variant="outline"
              className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Refresh Plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {plans.map((plan, index) => {
              const isPopular = index === 1 && plans.length > 2;
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={isPopular}
                  price={getPriceByBillingCycle(plan)}
                  billingLabel={getBillingLabel()}
                  onChoosePlan={handleChoosePlan}
                />
              );
            })}
          </div>

          <div className="text-center space-y-4 pt-8 border-t border-gray-800/50">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                30-day money-back guarantee
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                24/7 customer support
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              All plans include our core features. Upgrade or downgrade at any
              time. Prices shown are in Indian Rupees (₹) and exclude applicable
              taxes.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(PlansList);

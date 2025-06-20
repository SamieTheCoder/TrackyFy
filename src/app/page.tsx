"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowRightToLine,
  LogOut,
  ChevronRight,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Star,
  Check,
  LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SignUp, SignIn, SignOutButton, useUser } from "@clerk/nextjs";
import React, {
  Suspense,
  useEffect,
  useState,
  memo,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Lazy load heavy components
const PlansList = dynamic(() => import("./_components/plans-list"), {
  loading: () => <PlansListSkeleton />,
  ssr: false,
});

const PlansListSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl animate-pulse border border-gray-700"
      />
    ))}
  </div>
));

const AuthContent = memo(() => {
  const searchParams = useSearchParams();
  const form = searchParams.get("form");

  return (
    <div className="flex items-center justify-center w-full">
      {form === "sign-up" ? (
        <SignUp
          routing="hash"
          signInUrl="/?form=sign-in"
          fallbackRedirectUrl={"/account"}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/?form=sign-up"
          fallbackRedirectUrl={"/account"}
        />
      )}
    </div>
  );
});

AuthContent.displayName = "AuthContent";

const Logo = memo(({ className = "" }: { className?: string }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch("/favicon.svg");
        if (response.ok) {
          const data = await response.text();
          setSvgContent(data);
        }
      } catch (error) {
        console.error("Error loading SVG:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSvg();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-orange-500 to-pink-500 rounded-full animate-pulse`}
      />
    );
  }

  return (
    <div
      className={`logo-container ${className} transition-transform hover:scale-110 duration-300`}
      dangerouslySetInnerHTML={{ __html: svgContent || "" }}
    />
  );
});

Logo.displayName = "Logo";

const FeatureCard = memo(
  ({
    icon: Icon,
    title,
    description,
    gradient,
  }: {
    icon: LucideIcon;
    title: string;
    description: string;
    gradient: string;
  }) => (
    <Card className="group border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-orange-900/30 will-change-transform relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="pb-4 relative z-10">
        <div
          className={`mb-4 p-3 w-14 h-14 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-white text-xl group-hover:text-orange-100 transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </CardContent>
    </Card>
  )
);

FeatureCard.displayName = "FeatureCard";

const UserProfileSheet = memo(({ onClose }: { onClose: () => void }) => {
  const { user } = useUser();
  const router = useRouter();

  const handleDashboardClick = useCallback(() => {
    router.push("/account");
    onClose();
  }, [router, onClose]);

  const handlePlansClick = useCallback(() => {
    router.push("/account/user/purchase-plan");
    onClose();
  }, [router, onClose]);

  if (!user) return null;

  return (
    <Card className="w-full max-w-md mx-auto border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-col items-center space-y-6 pb-4">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-orange-500 shadow-2xl shadow-orange-900/30 ring-4 ring-orange-500/20">
            <AvatarImage
              src={user.imageUrl}
              alt={user.fullName || "User"}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-orange-500 to-pink-500 text-white">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
          <p className="text-gray-400">
            {user.primaryEmailAddress?.emailAddress}
          </p>
          <Badge
            variant="secondary"
            className="bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Premium Member
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-0 py-6">
        <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700/50 shadow-2xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="mr-2 h-5 w-5 text-orange-500" />
              Account Options
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your TrackyFy account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              onClick={handleDashboardClick}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-orange-500 transition-all"
              onClick={handlePlansClick}
            >
              <Star className="mr-2 h-4 w-4" />
              View Plans
            </Button>
          </CardContent>
          <CardContent className="pt-0">
            <div className="border-t border-gray-700 pt-4">
              <SignOutButton redirectUrl="/">
                <Button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-red-900 hover:to-red-800 border border-gray-700 hover:border-red-500 transition-all group">
                  <LogOut className="mr-2 h-4 w-4 group-hover:text-red-400 transition-colors" />
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
});

UserProfileSheet.displayName = "UserProfileSheet";

const StatsSection = memo(() => {
  const stats = [
    { label: "Active Gyms", value: "500+", icon: Users },
    { label: "Happy Members", value: "10K+", icon: Star },
    { label: "Revenue Tracked", value: "₹50M+", icon: TrendingUp },
    { label: "Countries Served", value: "15+", icon: Zap },
    { label: "Success Rate", value: "98%", icon: Check },
    { label: "Years Experience", value: "5+", icon: Shield },
  ];

  return (
    <div className="py-12 sm:py-16 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
        {/* Desktop view - grid layout */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.slice(0, 3).map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mobile view - horizontal scroll */}
        <div className="sm:hidden">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex-none w-40 text-center group snap-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center mt-4 gap-2">
            {stats.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-600"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

StatsSection.displayName = "StatsSection";

function Homepage() {
  const [openSheet, setOpenSheet] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const handleOpenSheet = useCallback(() => setOpenSheet(true), []);
  const handleCloseSheet = useCallback(() => setOpenSheet(false), []);

  const handleDashboardClick = useCallback(() => {
    router.push("/account");
  }, [router]);

  const scrollToPlans = useCallback(() => {
    const plansDiv = document.getElementById("plans");
    plansDiv?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToFeatures = useCallback(() => {
    const featuresDiv = document.getElementById("features");
    featuresDiv?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const featureCards = useMemo(
    () => [
      {
        icon: Users,
        title: "Member Management",
        description:
          "Streamline member registrations, track attendance, and manage memberships with our intuitive dashboard.",
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        icon: TrendingUp,
        title: "Analytics & Reports",
        description:
          "Get detailed insights on revenue, membership trends, and business performance with real-time analytics.",
        gradient: "from-green-500 to-emerald-500",
      },
      {
        icon: Zap,
        title: "Automated Workflows",
        description:
          "Automate payment processing, notifications, and member communications to save time and reduce errors.",
        gradient: "from-purple-500 to-violet-500",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Blended Navigation */}
      <nav className="relative z-10 py-4 sm:py-6 px-4 sm:px-6 md:px-10 flex justify-between items-center bg-transparent">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center group">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3" />
          <span className="group-hover:text-orange-400 transition-colors duration-300">
            <b className="text-white">Tracky</b>
            <b className="text-orange-600">.Fy</b>
          </span>
        </h1>

        <div className="flex gap-2 sm:gap-3">
          {isLoaded && isSignedIn ? (
            <div className="flex gap-2 sm:gap-3">
              <Button
                className="hidden sm:flex bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all text-white shadow-lg hover:shadow-xl text-sm"
                onClick={handleDashboardClick}
              >
                <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                Dashboard
              </Button>

              <Button
                onClick={handleOpenSheet}
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all border border-gray-600 hover:border-orange-500 text-sm"
              >
                <Users className="mr-1 sm:mr-2 h-4 w-4" />
                Profile
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleOpenSheet}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl text-sm"
            >
              Get Started
              <ArrowRightToLine className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </nav>

      {/* Optimized Hero Section for Mobile */}
      <div className="relative z-10 py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          <div className="flex-1 space-y-6 text-left lg:text-left">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 backdrop-blur-sm">
              <Zap className="mr-2 h-3 w-3 text-orange-400" />
              <span className="text-orange-400 text-xs font-medium">
                Next-Gen Gym Management Solution
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-left">
              <span className="text-white">Transform Your Gym With </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 animate-gradient">
                Tracky.Fy
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-left">
              The most powerful gym management platform. Streamline operations,
              boost revenue, and create exceptional member experiences.
            </p>

            {/* Mobile-optimized buttons - smaller and in one line */}
            <div className="flex flex-row gap-2 sm:gap-4 pt-4 justify-start">
              {isLoaded && isSignedIn ? (
                <Button
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all text-white px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-base shadow-2xl hover:shadow-orange-500/25 min-h-[44px] touch-manipulation"
                  onClick={handleDashboardClick}
                >
                  <TrendingUp className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Go to </span>Dashboard
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all text-white px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-base shadow-2xl hover:shadow-orange-500/25 min-h-[44px] touch-manipulation"
                  onClick={handleOpenSheet}
                >
                  <Zap className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Start </span>Free Trial
                </Button>
              )}

              <Button
                variant="outline"
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-orange-500 px-4 sm:px-6 py-2 sm:py-4 text-sm sm:text-base backdrop-blur-sm min-h-[44px] touch-manipulation"
                onClick={scrollToPlans}
              >
                <Star className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View </span>Pricing
              </Button>
            </div>

            <div className="flex items-start justify-start gap-4 sm:gap-6 pt-4 text-left">
              <div className="flex items-center text-xs sm:text-sm text-gray-400">
                <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                14-day free trial
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-400">
                <Check className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                No credit card required
              </div>
            </div>
          </div>

          {/* Optimized hero image section */}
          <div className="flex-1 relative w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative">
              <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-1 shadow-2xl">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10 overflow-hidden relative backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Logo className="w-32 h-32 sm:w-40 sm:h-40 opacity-80" />
                  </div>

                  {/* Optimized floating cards */}
                  <div className="absolute top-4 sm:top-8 left-4 sm:left-8 bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
                      <span className="text-white text-xs sm:text-sm">
                        500+ Active Gyms
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                      <span className="text-white text-xs sm:text-sm">
                        ₹50M+ Revenue
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimized decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div
                className="absolute -top-4 -left-4 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-8 sm:mt-12">
          <Button
            variant="ghost"
            className="animate-bounce rounded-full p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-orange-500 transition-all min-h-[44px] touch-manipulation"
            onClick={scrollToFeatures}
          >
            <ArrowDown size={20} className="text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12 sm:mb-16">
          <Badge
            variant="secondary"
            className="mb-4 sm:mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Why Choose Us
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive gym management solution provides cutting-edge
            tools to streamline operations, increase revenue, and deliver
            exceptional member experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureCards.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>

      {/* Plans Section */}
      <div
        id="plans"
        className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12 sm:mb-16">
          <Badge
            variant="secondary"
            className="mb-4 sm:mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30"
          >
            Flexible Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Start with our free trial and scale as your gym grows. No hidden
            fees, no long-term commitments.
          </p>
        </div>

        <PlansList />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 md:px-10 border-t border-gray-800/50 bg-gray-950/50 backdrop-blur-sm">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      {/* Company Info */}
      <div className="space-y-4">
        <div className="flex items-center group">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3" />
          <h3 className="text-xl sm:text-2xl font-bold group-hover:text-orange-400 transition-colors duration-300">
            <b className="text-white">Tracky</b>
            <b className="text-orange-600">.Fy</b>
          </h3>
        </div>
        <p className="text-gray-400 text-sm">
          The ultimate gym management platform for fitness businesses.
        </p>
      </div>

      {/* Legal Pages */}
      <div>
        <h4 className="text-white font-semibold mb-4">Legal</h4>
        <ul className="space-y-2">
          <li>
            <a href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Terms & Conditions
            </a>
          </li>
          <li>
            <a href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/refund" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Return & Refund Policy
            </a>
          </li>
          <li>
            <a href="/cancellation" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Cancellation Policy
            </a>
          </li>
        </ul>
      </div>

      {/* Support */}
      <div>
        <h4 className="text-white font-semibold mb-4">Support</h4>
        <ul className="space-y-2">
          <li>
            <a href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Contact Us
            </a>
          </li>
          <li>
            <a href="/about" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              About Us
            </a>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h4 className="text-white font-semibold mb-4">Contact</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <p>MD SAMIE SOHRAB</p>
          <p>Arbiya College Road</p>
          <p>Purnea, Bihar 854301</p>
          <p>India</p>
          <p>+91-99051-77065</p>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-center text-sm sm:text-base mb-4 md:mb-0">
          © {new Date().getFullYear()} TrackyFy. All rights reserved. Operated by MD SAMIE SOHRAB
        </p>
        <div className="flex items-center gap-4">
          <Badge
            variant="secondary"
            className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2 animate-pulse" />
            All Systems Operational
          </Badge>
        </div>
      </div>
    </div>
  </div>
</footer>

      {/* Enhanced Auth Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="!w-full sm:!w-[500px] !max-w-[600px] overflow-y-auto overflow-x-hidden flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border-l border-gray-800/50 backdrop-blur-xl">
          <SheetHeader className="w-full pt-8 pb-6 px-4 border-b border-gray-800/50">
            <SheetTitle className="text-center flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3" />
              <span>
                <span className="text-white">Tracky</span>
                <span className="text-orange-600">.Fy</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
            {isLoaded && isSignedIn ? (
              <UserProfileSheet onClose={handleCloseSheet} />
            ) : (
              <Card className="w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 shadow-2xl backdrop-blur-sm">
                <CardContent className="pt-6 sm:pt-8">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    }
                  >
                    <AuthContent />
                  </Suspense>
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Homepage;

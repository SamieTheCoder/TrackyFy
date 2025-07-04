// components/navigation/MenuItems.tsx
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { IUser } from "@/interfaces";
import { SignOutButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import {
  CalendarSync,
  FolderKanban,
  Home,
  UserRoundCheck,
  LogOut,
  User2,
  TicketPercent,
  BanknoteArrowUp,
  CreditCard,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

interface IMenuItemsProps {
  user: IUser;
  openMenuItems: boolean;
  setOpenMenuItems: React.Dispatch<React.SetStateAction<boolean>>;
}

function MenuItems({ user, openMenuItems, setOpenMenuItems }: IMenuItemsProps) {
  const iconSize = 20;
  const pathname = usePathname();
  const router = useRouter();
  
  // Loading states
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userMenuItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={iconSize} />, 
      route: "/account",
      description: "Overview & stats"
    },
    {
      name: "My Profile",
      icon: <User2 size={iconSize} />,
      route: "/account/user/profile",
      description: "Personal information"
    },
    {
      name: "My Subscriptions",
      icon: <CalendarSync size={iconSize} />,
      route: "/account/user/subscriptions",
      description: "Active memberships"
    },
    {
      name: "Browse Plans",
      icon: <FolderKanban size={iconSize} />,
      route: "/account/user/purchase-plan",
      description: "Available packages"
    },
  ];

  const adminMenuItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={iconSize} />, 
      route: "/account",
      description: "Admin overview"
    },
    {
      name: "Manage Plans",
      icon: <FolderKanban size={iconSize} />,
      route: "/account/admin/plans",
      description: "Create & edit plans"
    },
    {
      name: "Users",
      icon: <User2 size={iconSize} />,
      route: "/account/admin/users",
      description: "User management"
    },
    {
      name: "Subscriptions",
      icon: <CalendarSync size={iconSize} />,
      route: "/account/admin/subscriptions",
      description: "All memberships"
    },
    {
      name: "Customers",
      icon: <UserRoundCheck size={iconSize} />,
      route: "/account/admin/customers",
      description: "Customer database"
    },
    {
      name: "Cash Approval",
      icon: <BanknoteArrowUp size={iconSize} />,
      route: "/account/admin/cashapproval",
      description: "Payment approvals"
    },
    {
      name: "Payment Settings",
      icon: <CreditCard size={iconSize} />,
      route: "/account/admin/payment-settings",
      description: "Payment configuration"
    },
    {
      name: "Coupons",
      icon: <TicketPercent size={iconSize} />,
      route: "/account/admin/coupons-settings",
      description: "Discount management"
    },
  ];

  const menuItemsToRender = user.is_admin ? adminMenuItems : userMenuItems;

  const handleNavigation = async (route: string) => {
    setLoadingRoute(route);
    try {
      await router.push(route);
      setOpenMenuItems(false);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setLoadingRoute(null);
    }
  };

  const handleSignOut = () => {
    setIsSigningOut(true);
  };

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      <SheetContent className="w-full max-w-full sm:w-96 sm:max-w-md p-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        
        {/* Add proper SheetTitle for accessibility */}
        <SheetHeader className="sr-only">
          <SheetTitle>
            {user.is_admin ? 'Admin Navigation Menu' : 'User Navigation Menu'}
          </SheetTitle>
        </SheetHeader>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name || 'User'}
                </p>
                <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <Badge 
                    variant={user.is_admin ? "default" : "secondary"}
                    className={`text-xs px-1.5 py-0.5 sm:px-2 ${
                      user.is_admin 
                        ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" 
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}
                  >
                    {user.is_admin ? 'Admin' : 'Member'}
                  </Badge>
                </div>
              </div>
            </div>
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex-shrink-0"
              >
                <X size={14} className="sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pb-20">
          <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
            {menuItemsToRender.map((item, index) => {
              const isActive = pathname === item.route;
              const isLoading = loadingRoute === item.route;
              
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.route)}
                  disabled={isLoading || loadingRoute !== null}
                  className={`group relative w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-orange-800"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-colors ${
                      isActive 
                        ? "bg-orange-200 dark:bg-orange-800/40" 
                        : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    }`}>
                      {isLoading ? (
                        <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5">
                          {React.cloneElement(item.icon, { size: 16, className: "sm:w-5 sm:h-5" })}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? "text-orange-700 dark:text-orange-400" : ""
                      }`}>
                        {item.name}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${
                        isActive 
                          ? "text-orange-600 dark:text-orange-500" 
                          : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {isLoading ? "Loading..." : item.description}
                      </p>
                    </div>
                  </div>
                  {!isLoading && (
                    <ChevronRight 
                      size={12} 
                      className={`sm:w-3.5 sm:h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                        isActive 
                          ? "text-orange-600 dark:text-orange-500" 
                          : "text-slate-400 dark:text-slate-500"
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4">
          <SignOutButton redirectUrl="/">
            <Button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-10 sm:h-12 rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 font-medium">
                {isSigningOut ? (
                  <>
                    <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Signing Out...</span>
                    <span className="sm:hidden">Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut
                      size={16}
                      className="sm:w-5 sm:h-5 transition-all duration-300 group-hover:text-red-400"
                    />
                    Sign Out
                  </>
                )}
              </span>
            </Button>
          </SignOutButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MenuItems;

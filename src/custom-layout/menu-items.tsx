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
import {
  BadgeDollarSign,
  FolderKanban,
  Home,
  List,
  LogOut,
  User2,
  UserPlus,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface IMenuItemsProps {
  user: IUser;
  openMenuItems: boolean;
  setOpenMenuItems: React.Dispatch<React.SetStateAction<boolean>>;
}

function MenuItems({ user, openMenuItems, setOpenMenuItems }: IMenuItemsProps) {
  const iconSize = 18;

  const pathname = usePathname();
  const router = useRouter();

  const userMenuItems = [
    { name: "Home", icon: <Home size={iconSize} />, route: "/account" },
    {
      name: "Profile",
      icon: <User2 size={iconSize} />,
      route: "/account/user/profile",
    },
    {
      name: "Subscriptions",
      icon: <BadgeDollarSign size={iconSize} />,
      route: "/account/user/subscriptions",
    },
    {
      name: "Plans",
      icon: <FolderKanban size={iconSize} />,
      route: "/account/user/purchase-plan",
    },
    // {
    //   name: "Referrals",
    //   icon: <UserPlus size={iconSize} />,
    //   route: "/account/user/referrals",
    // },
  ];

  const adminMenuItems = [
    { name: "Home", icon: <Home size={iconSize} />, route: "/account" },
    {
      name: "Plans",
      icon: <FolderKanban size={iconSize} />,
      route: "/account/admin/plans",
    },
    {
      name: "Users",
      icon: <User2 size={iconSize} />,
      route: "/account/admin/users",
    },
    {
      name: "Subscriptions",
      icon: <BadgeDollarSign size={iconSize} />,
      route: "/account/admin/subscriptions",
    },
    {
      name: "Customers",
      icon: <List size={iconSize} />,
      route: "/account/admin/customers",
    },
    {
      name: "Cash Approval",
      icon: <List size={iconSize} />,
      route: "/account/admin/cashapproval",

    },
    // {
    //   name: "Referrals",
    //   icon: <UserPlus size={iconSize} />,
    //   route: "/account/admin/referrals",
    // },
  ];

  const menuItemsToRender = user.is_admin ? adminMenuItems : userMenuItems;

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      <SheetContent className="w-full max-w-xs p-6 bg-white dark:bg-gray-900">
        <SheetTitle></SheetTitle>

        <SheetHeader className="flex flex-col gap-8">
          <nav className="flex flex-col gap-4 mt-15">
            {menuItemsToRender.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  router.push(item.route);
                  setOpenMenuItems(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-left w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  pathname === item.route
                    ? "bg-orange-100 text-orange-700 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="text-base">{item.name}</span>
              </button>
            ))}
          </nav>

          <SignOutButton redirectUrl="/">
            <Button className="w-full relative overflow-hidden group flex items-center justify-center bg-black text-white border border-gray-800 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,50,50,0.5)]">
              <span className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Logout
                <LogOut
                  size={iconSize}
                  className="transition-all duration-300 group-hover:text-red-400"
                />
              </span>
            </Button>
          </SignOutButton>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

export default MenuItems;

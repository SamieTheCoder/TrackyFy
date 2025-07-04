"use client";
import React, { useState, useMemo } from "react";
import {
  getAllUsers,
  deleteUserById,
  getUserSubscriptionCount,
} from "@/actions/users";
import PageTitle from "@/components/ui/page-title";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IUser } from "@/interfaces";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  UserX,
  Package,
  ChevronRight,
  UserRoundCheck,
  Activity,
  ArrowLeft,
  User2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortField = "id" | "name" | "email" | "created_at" | "is_active";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "active" | "inactive" | "admin" | "customer";

interface DeleteUserData {
  id: string;
  name: string;
  email: string;
  subscriptionCount: number;
}

function AdminUsersListPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DeleteUserData | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const columns = [
    { key: "id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Created Date" },
    { key: "is_active", label: "Status & Roles" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await getAllUsers();
      if (!response.success) {
        toast.error("Failed to fetch users");
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
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
      <ArrowUp size={14} className="ml-1 text-slate-600 dark:text-slate-400" />
    ) : (
      <ArrowDown
        size={14}
        className="ml-1 text-slate-600 dark:text-slate-400"
      />
    );
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toString().includes(term);

      if (!matchesSearch) return false;

      switch (filterType) {
        case "active":
          return user.is_active === true;
        case "inactive":
          return user.is_active === false;
        case "admin":
          return user.is_admin === true;
        case "customer":
          return user.is_customer === true;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "is_active":
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, searchTerm, sortField, sortDirection, filterType]);

  const handleDeleteUser = async (user: IUser) => {
    try {
      const subscriptionResponse = await getUserSubscriptionCount(
        user.id.toString()
      );
      const subscriptionCount = subscriptionResponse.success
        ? subscriptionResponse.count
        : 0;

      setUserToDelete({
        id: user.id.toString(),
        name: user.name || "Unknown User",
        email: user.email || "No email",
        subscriptionCount,
      });
      setDeleteDialogOpen(true);
    } catch (error) {
      toast.error("Failed to get user subscription count");
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUserId(userToDelete.id);
      const response = await deleteUserById(userToDelete.id);

      if (response.success) {
        toast.success("User deleted successfully");
        setUsers((prev) =>
          prev.filter((user) => user.id.toString() !== userToDelete.id)
        );
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const exportUsers = () => {
    const csvData = [
      [
        "User ID",
        "Name",
        "Email",
        "Status",
        "Admin",
        "Customer",
        "Created Date",
      ],
      ...filteredAndSortedUsers.map((user) => [
        user.id,
        user.name || "N/A",
        user.email || "N/A",
        user.is_active ? "Active" : "Inactive",
        user.is_admin ? "Yes" : "No",
        user.is_customer ? "Yes" : "No",
        dayjs(user.created_at).format("YYYY-MM-DD HH:mm:ss"),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${dayjs().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enhanced badge function with larger sizes like AdminSubscriptions
  const getStatusAndRoleBadges = (user: IUser, compact = false) => {
    const badges = [];

    // Status badge - larger size like AdminSubscriptions
    if (!user.is_active) {
      badges.push(
        <span
          key="status"
          className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 ${
            compact ? "gap-1" : "gap-1.5"
          }`}
        >
          <Activity className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          Inactive
        </span>
      );
    } else {
      badges.push(
        <span
          key="status"
          className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${
            compact ? "gap-1" : "gap-1.5"
          }`}
        >
          <Activity className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          Active
        </span>
      );
    }

    // Role badges - larger size like AdminSubscriptions
    if (user.is_admin) {
      badges.push(
        <span
          key="admin"
          className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 ${
            compact ? "gap-1" : "gap-1.5"
          }`}
        >
          <Shield className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          Admin
        </span>
      );
    }

    if (user.is_customer) {
      badges.push(
        <span
          key="customer"
          className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 ${
            compact ? "gap-1" : "gap-1.5"
          }`}
        >
          <UserRoundCheck
            className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`}
          />
          Customer
        </span>
      );
    }

    return badges;
  };

  const handleUserClick = (user: IUser) => {
    setOpenDropdownId(null);
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  const handleDropdownOpenChange = (userId: string, open: boolean) => {
    if (open) {
      setOpenDropdownId(userId);
    } else {
      setOpenDropdownId(null);
    }
  };

  React.useEffect(() => {
    if (userDetailOpen || deleteDialogOpen) {
      setOpenDropdownId(null);
    }
  }, [userDetailOpen, deleteDialogOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center animate-pulse">
              <User2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="relative">
            {/* Enhanced Header Section */}
            <div className="mb-8">
              {/* Navigation */}
              <div className="mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="group border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                >
                  <Link href="/account" className="flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                    <span className="sm:hidden">Back</span>
                  </Link>
                </Button>
              </div>

              {/* Title Section */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-purple-700/30 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center shadow-lg">
                      <User2 className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                      Users Management
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      Manage and monitor all user accounts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="mb-6 space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value as FilterType)
                    }
                    className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="admin">Admins</option>
                    <option value="customer">Customers</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={fetchData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  <Button onClick={exportUsers} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Sort Options - Hidden on mobile */}
              <div className="hidden md:flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sort by:
                </span>
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

              {/* Results Summary */}
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredAndSortedUsers.length} of {users.length} users
              </div>
            </div>

            {/* No Users Found */}
            {!users.length && !loading && (
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <User2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No users found in the system.
                </p>
              </div>
            )}

            {/* No Search Results */}
            {users.length > 0 && !filteredAndSortedUsers.length && !loading && (
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No users match your current search and filter criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Users List */}
            {filteredAndSortedUsers.length > 0 && !loading && (
              <>
                {/* Desktop View with improved spacing */}
                <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-3">User Details</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-2">Created Date</div>
                      <div className="col-span-2">Status & Roles</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredAndSortedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* ID */}
                          <div className="col-span-1">
                            <span className="text-sm font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md border">
                              #{user.id}
                            </span>
                          </div>

                          {/* User Details */}
                          <div className="col-span-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-3 cursor-pointer">
                                  <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-white">
                                        {user.name?.charAt(0)?.toUpperCase() ||
                                          "?"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {user.name || "Unknown User"}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                      Clerk ID:{" "}
                                      {user.clerk_user_id?.substring(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {user.name || "Unknown User"}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    Full Clerk ID: {user.clerk_user_id}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    User ID: {user.id}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Email */}
                          <div className="col-span-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                  <Mail className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                                  <span className="text-base text-slate-900 dark:text-slate-100 truncate">
                                    {user.email || "No email"}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {user.email || "No email address provided"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Created Date */}
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                              <div>
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                  {dayjs(user.created_at).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {dayjs(user.created_at).format("HH:mm")}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status & Roles */}
                          <div className="col-span-2">
                            <div className="flex flex-wrap gap-1.5">
                              {getStatusAndRoleBadges(user)}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 text-right">
                            <DropdownMenu
                              open={openDropdownId === user.id?.toString()}
                              onOpenChange={(open) =>
                                handleDropdownOpenChange(
                                  user.id?.toString() || "",
                                  open
                                )
                              }
                            >
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(user);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user);
                                  }}
                                  disabled={
                                    deletingUserId === user.id.toString()
                                  }
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                  {filteredAndSortedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {user.email || `ID: ${user.id}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Badges Section - Moved to separate row */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex flex-wrap gap-2">
                          {getStatusAndRoleBadges(user, true)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Detail Modal */}
          <Dialog
            open={userDetailOpen}
            onOpenChange={(open) => {
              setUserDetailOpen(open);
              if (!open) {
                setOpenDropdownId(null);
              }
            }}
          >
            <DialogContent className="max-w-SM">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <User2 className="h-5 w-5 mr-2" />
                  User Details
                </DialogTitle>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {selectedUser.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedUser.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ID: {selectedUser.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        {selectedUser.email || "No email"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        {dayjs(selectedUser.created_at).format(
                          "MMM DD, YYYY HH:mm"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        Status & Roles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {getStatusAndRoleBadges(selectedUser)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Clerk ID:</span>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {selectedUser.clerk_user_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserDetailOpen(false);
                        handleDeleteUser(selectedUser);
                      }}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) {
                setOpenDropdownId(null);
              }
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Delete User Account
                </DialogTitle>
                <DialogDescription className="space-y-3">
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>{userToDelete?.name}</strong>?
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                      This action will:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• Delete the user from Clerk authentication</li>
                      <li>• Remove user data from Supabase</li>
                      <li>
                        • Delete all associated subscriptions (
                        {userToDelete?.subscriptionCount || 0})
                      </li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deletingUserId !== null}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteUser}
                  disabled={deletingUserId !== null}
                >
                  {deletingUserId ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AdminUsersListPage;

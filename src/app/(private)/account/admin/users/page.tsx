"use client";
import React, { useState, useMemo } from "react";
import { getAllUsers, deleteUserById, getUserSubscriptionCount } from "@/actions/users";
import PageTitle from "@/components/ui/page-title";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IUser } from "@/interfaces";
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
  Package
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DeleteUserData | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const columns = [
    { key: "id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Created Date" },
    { key: "is_active", label: "Status" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await getAllUsers();
      if (!response.success) {
        toast.error("Failed to fetch users");
      } else {
        setUsers(response.data || []);
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
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-slate-600 dark:text-slate-400" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-slate-600 dark:text-slate-400" />
    );
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search filter
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toString().includes(term);

      if (!matchesSearch) return false;

      // Type filter
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

    // Sort users
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
      // Get user's subscription count
      const subscriptionResponse = await getUserSubscriptionCount(user.id.toString());
      const subscriptionCount = subscriptionResponse.success ? subscriptionResponse.count : 0;
      
      setUserToDelete({
        id: user.id.toString(),
        name: user.name || "Unknown User",
        email: user.email || "No email",
        subscriptionCount
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
        setUsers(prev => prev.filter(user => user.id.toString() !== userToDelete.id));
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
      ['User ID', 'Name', 'Email', 'Status', 'Admin', 'Customer', 'Created Date'],
      ...filteredAndSortedUsers.map(user => [
        user.id,
        user.name || 'N/A',
        user.email || 'N/A',
        user.is_active ? 'Active' : 'Inactive',
        user.is_admin ? 'Yes' : 'No',
        user.is_customer ? 'Yes' : 'No',
        dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss')
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (user: IUser) => {
    if (!user.is_active) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center">
          <UserX className="h-3 w-3 mr-1" />
          Inactive
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center">
        <User className="h-3 w-3 mr-1" />
        Active
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
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <PageTitle title="All Users" />
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                  Manage and monitor all user accounts
                </p>
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
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
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
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={exportUsers}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
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

            {/* Results Summary */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredAndSortedUsers.length} of {users.length} users
            </div>
          </div>

          {/* No Users Found */}
          {!users.length && !loading && (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No users found in the system.</p>
            </div>
          )}

          {/* No Search Results */}
          {users.length > 0 && !filteredAndSortedUsers.length && !loading && (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No users match your current search and filter criteria.</p>
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Table Header */}
              <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-12 gap-4 items-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-3">User Details</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Created Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Roles</div>
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
                        <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                          {user.id}
                        </span>
                      </div>

                      {/* User Details */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Clerk ID: {user.clerk_user_id?.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-900 dark:text-slate-100 truncate">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-sm text-slate-900 dark:text-slate-100">
                              {dayjs(user.created_at).format("MMM DD, YYYY")}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {dayjs(user.created_at).format("HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        {getStatusBadge(user)}
                      </div>

                      {/* Roles */}
                      <div className="col-span-1">
                        <div className="flex flex-col space-y-1">
                          {user.is_admin && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          )}
                          {user.is_customer && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                              Customer
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem> */}
                            <DropdownMenuItem 
                              className="text-red-600 dark:text-red-400"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingUserId === user.id.toString()}
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
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Delete User Account
              </DialogTitle>
              <DialogDescription className="space-y-3">
                <p>
                  Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    This action will:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• Delete the user from Clerk authentication</li>
                    <li>• Remove user data from Supabase</li>
                    <li>• Delete all associated subscriptions ({userToDelete?.subscriptionCount || 0})</li>
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
  );
}

export default AdminUsersListPage;

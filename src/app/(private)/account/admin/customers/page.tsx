"use client";
import React, { useState, useMemo } from "react";
import { getAllCustomers } from "@/actions/users";
import PageTitle from "@/components/ui/page-title";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
  RefreshCw,
  Download,
  Users,
  Mail,
  Calendar,
  Package,
  Eye,
  MoreVertical,
  UserCheck,
  ChevronRight,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

type SortField = "id" | "name" | "email" | "created_at";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "active" | "inactive" | "recent";

function AdminCustomersList() {
  const [customers, setCustomers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<IUser | null>(null);
  const [customerDetailOpen, setCustomerDetailOpen] = useState(false);

  const columns = [
    { key: "id", label: "Customer ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "created_at", label: "Joined Date" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await getAllCustomers();
      if (!response.success) {
        toast.error("Failed to fetch customers");
      } else {
        setCustomers(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch customers");
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

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.id?.toString().includes(term);

      if (!matchesSearch) return false;

      switch (filterType) {
        case "active":
          return customer.is_active === true;
        case "inactive":
          return customer.is_active === false;
        case "recent":
          return dayjs().diff(dayjs(customer.created_at), 'days') <= 30;
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
  }, [customers, searchTerm, sortField, sortDirection, filterType]);

  const exportCustomers = () => {
    const csvData = [
      ['Customer ID', 'Name', 'Email', 'Status', 'Joined Date'],
      ...filteredAndSortedCustomers.map(customer => [
        customer.id,
        customer.name || 'N/A',
        customer.email || 'N/A',
        customer.is_active ? 'Active' : 'Inactive',
        dayjs(customer.created_at).format('YYYY-MM-DD HH:mm:ss')
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusAndRoleBadges = (customer: IUser, compact = false) => {
    const badges = [];
    
    // Status badge (always first)
    if (!customer.is_active) {
      badges.push(
        <span key="status" className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 ${compact ? 'gap-0.5' : 'gap-1'}`}>
          <Activity className={`${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
          {!compact && "Inactive"}
        </span>
      );
    } else {
      badges.push(
        <span key="status" className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${compact ? 'gap-0.5' : 'gap-1'}`}>
          <Activity className={`${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
          {!compact && "Active"}
        </span>
      );
    }
    
    // Customer badge
    badges.push(
      <span key="customer" className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 ${compact ? 'gap-0.5' : 'gap-1'}`}>
        <UserCheck className={`${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
        {!compact && "Customer"}
      </span>
    );
    
    return badges;
  };

  const handleCustomerClick = (customer: IUser) => {
    setSelectedCustomer(customer);
    setCustomerDetailOpen(true);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    const inactive = customers.filter(c => !c.is_active).length;
    const recent = customers.filter(c => dayjs().diff(dayjs(c.created_at), 'days') <= 30).length;

    return { total, active, inactive, recent };
  }, [customers]);

  return (
    <TooltipProvider>
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
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <PageTitle title="All Customers" />
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                    Manage and monitor all customer accounts
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Customers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Inactive Customers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">New This Month</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.recent}</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                    className="w-full lg:w-40 pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="recent">Recent (30 days)</option>
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
                    onClick={exportCustomers}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Sort Options - Hidden on mobile */}
              <div className="hidden md:flex flex-wrap gap-2 items-center">
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
                Showing {filteredAndSortedCustomers.length} of {customers.length} customers
              </div>
            </div>

            {/* No Customers Found */}
            {!customers.length && !loading && (
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No customers found in the system.</p>
              </div>
            )}

            {/* No Search Results */}
            {customers.length > 0 && !filteredAndSortedCustomers.length && !loading && (
              <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No customers match your current search and filter criteria.</p>
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

            {/* Customers List */}
            {filteredAndSortedCustomers.length > 0 && !loading && (
              <>
                {/* Desktop View */}
                <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-12 gap-2 items-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-3">Customer Details</div>
                      <div className="col-span-2">Email</div>
                      <div className="col-span-2">Joined Date</div>
                      <div className="col-span-3">Status & Type</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredAndSortedCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* ID */}
                          <div className="col-span-1">
                            <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                              {customer.id}
                            </span>
                          </div>

                          {/* Customer Details */}
                          <div className="col-span-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-3 cursor-pointer">
                                  <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {customer.name || "Unknown Customer"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      Customer #{customer.id}
                                    </p>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">{customer.name || "Unknown Customer"}</p>
                                  <p className="text-xs opacity-75">Customer ID: {customer.id}</p>
                                  <p className="text-xs opacity-75">Joined: {dayjs(customer.created_at).format("MMM DD, YYYY")}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Email */}
                          <div className="col-span-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                  <Mail className="h-3 w-3 text-slate-400 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-slate-900 dark:text-slate-100 truncate">
                                    {customer.email || "No email"}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{customer.email || "No email address provided"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {/* Joined Date */}
                          <div className="col-span-2">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 text-slate-400 mr-2" />
                              <div>
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                  {dayjs(customer.created_at).format("MMM DD, YYYY")}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {dayjs(customer.created_at).fromNow()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status & Type */}
                          <div className="col-span-3">
                            <div className="flex flex-wrap gap-1">
                              {getStatusAndRoleBadges(customer)}
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
                                <DropdownMenuItem onClick={() => handleCustomerClick(customer)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
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
                  {filteredAndSortedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {customer.name || "Unknown Customer"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {customer.email || `Customer #${customer.id}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="flex flex-wrap gap-1">
                            {getStatusAndRoleBadges(customer, true)}
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Customer Detail Modal */}
          <Dialog open={customerDetailOpen} onOpenChange={setCustomerDetailOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Customer Details
                </DialogTitle>
              </DialogHeader>
              {selectedCustomer && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {selectedCustomer.name || "Unknown Customer"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Customer #{selectedCustomer.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{selectedCustomer.email || "No email"}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        Joined {dayjs(selectedCustomer.created_at).format("MMM DD, YYYY")}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Status & Type:</span>
                      <div className="flex flex-wrap gap-1">
                        {getStatusAndRoleBadges(selectedCustomer)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Member for:</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {dayjs(selectedCustomer.created_at).fromNow(true)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default AdminCustomersList;

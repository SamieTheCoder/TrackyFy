"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  HelpCircle, 
  Download,
  RefreshCw,
  FolderKanban,
  CalendarSync,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuickActionsProps {
  subscriptionProgress: {
    isExpiring: boolean;
    isExpired: boolean;
    status: "expired" | "expiring" | "active";
  } | null;
  onDownloadInvoice?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ subscriptionProgress, onDownloadInvoice }) => {
  const [contactLoading, setContactLoading] = useState(false);
  const router = useRouter();

  const handleContactSupport = async () => {
    setContactLoading(true);
    
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to contact page
      router.push('/contact');
      
      // Show success message
      toast.success("Redirecting to support...");
    } catch (error) {
      toast.error("Failed to open support. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const actions = [
    {
      icon: FolderKanban,
      label: 'View Plans',
      href: '/account/user/purchase-plan',
      color: 'bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-violet-900/30 dark:via-purple-900/20 dark:to-fuchsia-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-200 dark:border-violet-800',
      hoverColor: 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
      description: 'Browse subscription plans'
    },
    {
      icon: CalendarSync,
      label: 'All Subscriptions',
      href: '/account/user/subscriptions',
      color: 'bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      hoverColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
      description: 'View subscription history'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/account/user/profile',
      color: 'bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 dark:from-blue-900/30 dark:via-sky-900/20 dark:to-cyan-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      description: 'Manage your account'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
            <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1 flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Manage your account
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4">
        {/* Renewal Alert */}
        {subscriptionProgress?.isExpiring && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                🚨 Renewal Required
              </span>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/account/user/purchase-plan" className="flex items-center justify-center">
                <RefreshCw size={16} className="mr-2" />
                Renew Now
              </Link>
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className={`w-full justify-start p-4 h-auto ${action.borderColor} ${action.hoverColor} transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]`}
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-4 w-full">
                  <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <IconComponent className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      {action.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}

        {/* Contact Support Button with Enhanced Loading */}
        <Button
          onClick={handleContactSupport}
          disabled={contactLoading}
          variant="outline"
          className="w-full justify-start p-4 h-auto border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02]"
        >
          <div className="flex items-center space-x-4 w-full">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 dark:from-rose-900/30 dark:via-pink-900/20 dark:to-red-900/30 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              {contactLoading ? (
                <div className="h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HelpCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                {contactLoading ? 'Connecting...' : 'Support'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {contactLoading ? 'Opening support center' : 'Get help and support'}
              </div>
            </div>
          </div>
        </Button>

        {/* Download PDF Invoice */}
        {onDownloadInvoice && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={onDownloadInvoice}
              variant="ghost"
              className="w-full justify-start p-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 transition-all duration-300 group hover:shadow-md rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 dark:from-emerald-900/30 dark:via-green-900/20 dark:to-teal-900/30 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">Download PDF Invoice</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;

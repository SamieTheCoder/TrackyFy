"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Settings, 
  HelpCircle, 
  Download,
  RefreshCw,
  FolderKanban,
  CalendarSync
} from 'lucide-react';

interface QuickActionsProps {
  subscriptionProgress: {
    isExpiring: boolean;
    isExpired: boolean;
    status: "expired" | "expiring" | "active";
  } | null;
  onDownloadInvoice?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ subscriptionProgress, onDownloadInvoice }) => {
  const actions = [
    {
      icon: FolderKanban,
      label: 'View Plans',
      href: '/account/user/purchase-plan',
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      description: 'Browse subscription plans'
    },
    {
      icon: CalendarSync,
      label: 'All Subscriptions',
      href: '/account/user/subscriptions',
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      description: 'View subscription history'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/account/user/profile',
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      description: 'Manage your account'
    },
    {
      icon: HelpCircle,
      label: 'Support',
      href: '/contact',
      color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      description: 'Get help and support'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your account</p>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4">
        {/* Renewal Alert */}
        {subscriptionProgress?.isExpiring && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Renewal Required
              </span>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
              className="w-full justify-start p-4 h-auto border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {action.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}

        {/* Download PDF Invoice */}
        {onDownloadInvoice && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={onDownloadInvoice}
              variant="ghost"
              className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActions;
  
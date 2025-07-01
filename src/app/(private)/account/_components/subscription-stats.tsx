"use client";
import React from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface SubscriptionStatsProps {
  subscriptionProgress: {
    progressPercentage: number;
    daysRemaining: number;
    totalDays: number;
    isExpiring: boolean;
    isExpired: boolean;
    status: "expired" | "expiring" | "active";
  };
}

const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({ subscriptionProgress }) => {
  const stats = [
    {
      icon: Clock,
      label: 'Days Left',
      value: subscriptionProgress.daysRemaining,
      color: subscriptionProgress.daysRemaining <= 7 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      bgColor: subscriptionProgress.daysRemaining <= 7 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: `${Math.round(subscriptionProgress.progressPercentage)}%`,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
    },
    {
      icon: Calendar,
      label: 'Total Days',
      value: subscriptionProgress.totalDays,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
    }
  ];

  return (
    <div className="mt-6 grid grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={index} 
            className={`text-center p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${stat.bgColor}`}
          >
            <div className="flex justify-center mb-2">
              <IconComponent className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className={`font-bold text-lg ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionStats;

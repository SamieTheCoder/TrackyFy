import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  name: string;
  description: string;
  value: number;
  isCurrency?: boolean;
  icon?: LucideIcon;
  color?: string;
  trend?: { value: number; isPositive: boolean } | null;
  isAlert?: boolean;
}

function DashboardCard({
  name,
  description,
  value,
  isCurrency = false,
  icon: Icon,
  color = "from-orange-400 to-orange-600",
  trend,
  isAlert = false,
}: DashboardCardProps) {
  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border ${
      isAlert && value > 0 
        ? 'border-amber-200 dark:border-amber-800' 
        : 'border-slate-200 dark:border-slate-700'
    }`}>
      <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${color}`}></div>
      
      {isAlert && value > 0 && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">{name}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{description}</p>
          </div>
          {Icon && (
            <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${color} bg-opacity-10 flex-shrink-0 ml-2`}>
              <Icon size={20} className="text-slate-700 dark:text-slate-300" />
            </div>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isCurrency ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
          </h1>
          
          {trend && (
            <div className={`flex items-center text-sm ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;

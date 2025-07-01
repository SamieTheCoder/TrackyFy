"use client";
import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface SubscriptionProgressBarProps {
  progress: number;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired';
}

const SubscriptionProgressBar: React.FC<SubscriptionProgressBarProps> = ({
  progress,
  daysRemaining,
  status
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);

    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressGradient = () => {
    if (status === 'expired') return 'from-red-400 to-red-500';
    if (status === 'expiring') return 'from-amber-400 to-amber-500';
    if (progress > 75) return 'from-red-400 to-red-500';
    if (progress > 50) return 'from-amber-400 to-amber-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const getStatusIcon = () => {
    if (status === 'expired') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (status === 'expiring') return <Clock className="h-4 w-4 text-amber-500" />;
    return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  };

  const getStatusText = () => {
    if (status === 'expired') return 'Subscription Expired';
    if (status === 'expiring') return 'Expiring Soon';
    return 'Active Subscription';
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {getStatusText()}
          </span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {Math.round(progress)}% completed
        </span>
      </div>
      
      <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressGradient()} transition-all duration-1000 ease-out relative rounded-full`}
          style={{ width: `${animatedProgress}%` }}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full"></div>
        </div>
        
        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow-sm">
            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
          </span>
        </div>
      </div>

      {/* Progress milestones */}
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
          Start
        </span>
        <span className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-1 ${
            progress < 25 ? 'bg-emerald-500' : 
            progress < 50 ? 'bg-amber-500' : 
            progress < 75 ? 'bg-orange-500' : 'bg-red-500'
          }`}></div>
          {progress < 25 ? 'Fresh' : 
           progress < 50 ? 'Halfway' : 
           progress < 75 ? 'Ending Soon' : 'Critical'}
        </span>
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          End
        </span>
      </div>
    </div>
  );
};

export default SubscriptionProgressBar;

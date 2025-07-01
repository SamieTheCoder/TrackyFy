"use client";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionExpiryChartProps {
  expiringToday: number;
  expiringThisWeek: number;
  expiringNextWeek: number;
  expiredThisWeek: number;
}

const COLORS = {
  today: '#ef4444',      // red-500
  thisWeek: '#f59e0b',   // amber-500
  nextWeek: '#3b82f6',   // blue-500
  expired: '#6b7280',    // gray-500
};

function SubscriptionExpiryChart({ 
  expiringToday, 
  expiringThisWeek, 
  expiringNextWeek, 
  expiredThisWeek 
}: SubscriptionExpiryChartProps) {
  const data = [
    { name: 'Expiring Today', value: expiringToday, color: COLORS.today },
    { name: 'Expiring This Week', value: expiringThisWeek, color: COLORS.thisWeek },
    { name: 'Expiring Next Week', value: expiringNextWeek, color: COLORS.nextWeek },
    { name: 'Expired This Week', value: expiredThisWeek, color: COLORS.expired },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].value} subscription{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const total = expiringToday + expiringThisWeek + expiringNextWeek + expiredThisWeek;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Expiry Overview</CardTitle>
        <CardDescription>
          Distribution of subscription expiration timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p>All subscriptions are active!</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {expiringToday + expiringThisWeek}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Urgent Action Needed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {expiringNextWeek}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Plan Ahead</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionExpiryChart;

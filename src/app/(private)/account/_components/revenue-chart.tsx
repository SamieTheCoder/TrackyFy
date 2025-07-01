"use client";
import React from "react";
import { TrendingUp, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

// Custom tooltip component for recharts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white dark:bg-slate-800 p-3 shadow-sm border-slate-200 dark:border-slate-700">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <div
              className="h-2 w-2 rounded-full bg-slate-600"
            />
            <span>Revenue</span>
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
            ₹{Number(payload[0].value).toLocaleString()}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // Calculate percentage change from previous month
  const calculateTrend = () => {
    if (data.length < 2) return { percentage: 0, trending: "neutral" };
    
    const currentMonth = data[data.length - 1].revenue;
    const previousMonth = data[data.length - 2].revenue;
    
    if (previousMonth === 0) return { percentage: 100, trending: "up" };
    
    const percentage = ((currentMonth - previousMonth) / previousMonth) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      trending: percentage >= 0 ? "up" : "down"
    };
  };

  const trend = calculateTrend();

  // Format data for chart
  const chartData = data.map(item => ({
    month: item.month,
    revenue: item.revenue,
  }));

  // Export CSV function
  const exportCSV = () => {
    // Create CSV header
    const csvHeader = ["Month,Revenue"];
    
    // Create CSV rows
    const csvRows = data.map(item => `${item.month},${item.revenue}`);
    
    // Combine header and rows
    const csvString = [...csvHeader, ...csvRows].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-slate-900 dark:text-slate-100">Monthly Revenue</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{new Date().getFullYear()} Revenue Report</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 border-slate-300 dark:border-slate-600"
          onClick={exportCSV}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                tickMargin={10} 
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value: number) => `₹${value}`}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#64748b"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-slate-700 dark:text-slate-300">
          {trend.trending === "up" ? (
            <>Trending up by {trend.percentage}% this month <TrendingUp className="h-4 w-4 text-green-500" /></>
          ) : trend.trending === "down" ? (
            <>Trending down by {trend.percentage}% this month <TrendingUp className="h-4 w-4 text-red-500 rotate-180" /></>
          ) : (
            <>No change this month</>
          )}
        </div>
        <div className="leading-none text-slate-500 dark:text-slate-400">
          Showing monthly revenue for {new Date().getFullYear()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RevenueChart;

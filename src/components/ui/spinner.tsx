import React from "react";

function PulseRingSpinner({
  parentHeight = "100%",
  size = "md",
  color = "blue",
}: {
  parentHeight?: number | string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "gray";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
  };

  return (
    <div
      className="flex flex-col justify-center items-center"
      style={{ height: parentHeight }}
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-opacity-20 rounded-full`}
        />
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} ${colorClasses[color]} border-4 border-transparent border-t-current rounded-full animate-spin`}
        />
        <div
          className={`absolute top-1 left-1 ${sizeClasses[size]} border-2 border-opacity-30 rounded-full animate-ping`}
          style={{
            width: `calc(100% - 8px)`,
            height: `calc(100% - 8px)`,
            borderColor: colorClasses[color]
              .replace("border-", "")
              .replace("-500", ""),
          }}
        />
      </div>
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium animate-pulse">
        Loading...
      </div>
    </div>
  );
}

export default PulseRingSpinner;

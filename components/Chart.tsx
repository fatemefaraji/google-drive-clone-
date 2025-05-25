"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculatePercentage, convertFileSize } from "@/lib/utils";

// Define TypeScript interfaces
interface ChartProps {
  used?: number;
  total?: number;
}

// Chart configuration
const chartConfig: ChartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "hsl(var(--chart-1))", // Use CSS variable for theme adaptability
  },
};

const TOTAL_STORAGE = 2 * 1024 * 1024 * 1024; // 2GB in bytes

export const StorageChart: React.FC<ChartProps> = ({ used = 0, total = TOTAL_STORAGE }) => {
  // Ensure used and total are non-negative
  const safeUsed = Math.max(0, used);
  const safeTotal = Math.max(1, total); // Prevent division by zero
  const percentage = calculatePercentage(safeUsed, safeTotal);

  const chartData = [
    {
      storage: "used",
      value: safeUsed,
      fill: chartConfig.used.color,
    },
  ];

  return (
    <Card
      className="chart bg-white dark:bg-gray-800 shadow-md"
      aria-labelledby="storage-chart-title"
    >
      <CardHeader className="chart-details pb-2">
        <CardTitle id="storage-chart-title" className="chart-title text-lg font-semibold">
          Available Storage
        </CardTitle>
        <CardDescription className="chart-description text-sm text-gray-500 dark:text-gray-400">
          {safeUsed > 0 ? convertFileSize(safeUsed) : "0 B"} / {convertFileSize(safeTotal)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <ChartContainer
          config={chartConfig}
          className="chart-container mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={Math.min(360, percentage * 3.6 + 90)} // Cap at 360 degrees
            innerRadius={80}
            outerRadius={110}
            barSize={10}
            accessibilityLayer
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="polar-grid"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="value"
              background={{ fill: "hsl(var(--background))" }}
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        role="img"
                        aria-label={`${percentage.toFixed(0)}% storage used`}
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="chart-total-percentage text-2xl font-bold fill-gray-900 dark:fill-white"
                        >
                          {percentage.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray-500 dark:fill-gray-400 text-sm"
                        >
                          Space used
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StorageChart;
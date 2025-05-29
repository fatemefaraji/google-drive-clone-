"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { sortTypes } from "@/constants";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface SortType {
  value: string;
  label: string;
}

interface SortProps {
  className?: string;
}

const Sort: React.FC<SortProps> = ({ className }) => {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || sortTypes[0]?.value || "";

  const handleSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== sortTypes[0]?.value) {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      router.push(`${path}?${params.toString()}`);
    },
    [path, router, searchParams]
  );

  // Fallback if sortTypes is empty
  if (!sortTypes || sortTypes.length === 0) {
    return (
      <div
        className={cn("text-red-500 text-sm", className)}
        aria-label="Sort error"
      >
        Error: No sort options available
      </div>
    );
  }

  return (
    <Select
      onValueChange={handleSort}
      defaultValue={currentSort}
      value={currentSort}
      aria-label="Sort files"
    >
      <SelectTrigger
        className={cn(
          "sort-select w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
          className
        )}
      >
        <SelectValue placeholder={sortTypes[0].label} />
      </SelectTrigger>
      <SelectContent className="sort-select-content bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        {sortTypes.map(({ value, label }: SortType) => (
          <SelectItem
            key={value}
            value={value}
            className="shad-select-item hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
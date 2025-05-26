import React from "react";
import { cn, formatDateTime } from "@/lib/utils";

// Define TypeScript interfaces
interface FormattedDateTimeProps {
  date: string | Date;
  className?: string;
  format?: "short" | "medium" | "long" | "custom";
  customFormat?: string;
}

export const FormattedDateTime: React.FC<FormattedDateTimeProps> = ({
  date,
  className,
  format = "medium",
  customFormat,
}) => {
  // Handle invalid or missing date
  if (!date) {
    return (
      <p
        className={cn("body-1 text-gray-500 dark:text-gray-400", className)}
        aria-label="Invalid date"
      >
        Invalid date
      </p>
    );
  }

  // Convert string to Date if necessary
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return (
      <p
        className={cn("body-1 text-gray-500 dark:text-gray-400", className)}
        aria-label="Invalid date"
      >
        Invalid date
      </p>
    );
  }

  // Format date based on provided format
  let formattedDate: string;
  try {
    if (format === "custom" && customFormat) {
      formattedDate = formatDateTime(parsedDate, customFormat);
    } else {
      formattedDate = formatDateTime(parsedDate, format);
    }
  } catch (error) {
    console.warn("Error formatting date:", error);
    formattedDate = "Error formatting date";
  }

  return (
    <p
      className={cn("body-1 text-gray-500 dark:text-gray-400", className)}
      aria-label={`Formatted date: ${formattedDate}`}
    >
      {formattedDate}
    </p>
  );
};

export default FormattedDateTime;
"use client";

import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

// Define TypeScript interfaces
interface ThumbnailProps {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
  alt?: string;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
  alt = "File thumbnail",
}) => {
  const isImage = type === "image" && extension.toLowerCase() !== "svg";
  const imageSrc = isImage && url ? url : getFileIcon(extension, type);

  // Fallback for missing or invalid image source
  if (!imageSrc) {
    return (
      <figure
        className={cn(
          "thumbnail flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md",
          className
        )}
        aria-label={alt}
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">No preview</span>
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        "thumbnail flex items-center justify-center",
        className
      )}
      aria-label={alt}
    >
      <Image
        src={imageSrc}
        alt={isImage ? alt : ""}
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image rounded-md",
          !isImage && "dark:filter dark:invert" // Ensure icons are visible in dark mode
        )}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = "/assets/icons/file-default.svg"; // Fallback icon
        }}
      />
    </figure>
  );
};

export default Thumbnail;
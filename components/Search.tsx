"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { useDebounce } from "use-debounce";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface AppwriteFile extends Models.Document {
  name: string;
  extension: string;
  url: string;
  type: string;
  $createdAt: string;
}

interface SearchResult {
  documents: AppwriteFile[];
}

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppwriteFile[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const router = useRouter();
  const path = usePathname();
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (debouncedQuery.length === 0) {
      setResults([]);
      setOpen(false);
      router.push(path.split("?")[0]); // Clear query params
      return;
    }

    setIsLoading(true);
    try {
      const files: SearchResult = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.documents);
      setOpen(true);
    } catch (error: any) {
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to search files: {error.message || "Unknown error"}
          </p>
        ),
        className: "error-toast bg-red-600",
        duration: 5000,
      });
      setResults([]);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, router, path, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
      setOpen(false);
      setResults([]);
    } else if (searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleClickItem = useCallback(
    (file: AppwriteFile) => {
      setOpen(false);
      setResults([]);
      const typePath = file.type === "video" || file.type === "audio" ? "media" : `${file.type}s`;
      router.push(`/${typePath}?query=${encodeURIComponent(query)}`);
    },
    [query, router]
  );

  return (
    <div className="search relative w-full max-w-md" aria-label="File search">
      <div className="search-input-wrapper flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2">
        <Image
          src="/assets/icons/search.svg"
          alt=""
          width={24}
          height={24}
          className="fill-current"
        />
        <Input
          value={query}
          placeholder="Search files..."
          className="search-input border-0 bg-transparent focus-visible:ring-0 dark:text-white"
          onChange={(e) => setQuery(e.target.value.trim())}
          disabled={isLoading}
          aria-label="Search for files"
        />
        {isLoading && (
          <Image
            src="/assets/icons/loader.svg"
            alt="Loading"
            width={20}
            height={20}
            className="animate-spin"
          />
        )}
      </div>
      {open && (
        <ul
          className="search-result absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto"
          aria-label="Search results"
        >
          {results.length > 0 ? (
            results.map((file) => (
              <li
                key={file.$id}
                className="flex items-center justify-between gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleClickItem(file)}
                role="option"
                aria-selected={false}
              >
                <div className="flex items-center gap-4">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                    aria-label={`Thumbnail for ${file.name}`}
                  />
                  <p
                    className="subtitle-2 line-clamp-1 text-gray-900 dark:text-white"
                    title={file.name}
                  >
                    {file.name || "Unnamed file"}
                  </p>
                </div>
                <FormattedDateTime
                  date={file.$createdAt}
                  className="caption line-clamp-1 text-gray-500 dark:text-gray-400"
                />
              </li>
            ))
          ) : (
            <p className="empty-result p-3 text-gray-500 dark:text-gray-400 text-sm">
              No files found
            </p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
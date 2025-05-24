import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";

// Define TypeScript interface for file
interface AppwriteFile extends Models.Document {
  name: string;
  extension: string;
  size: number;
  url: string;
  type: string;
  owner: { fullName: string };
  $createdAt: string;
}

interface CardProps {
  file: AppwriteFile;
}

const Card: React.FC<CardProps> = ({ file }) => {
  // Fallback for missing file data
  if (!file || !file.url) {
    return (
      <div className="file-card-error bg-red-50 border border-red-200 rounded-lg p-4 text-red-500 text-sm">
        Error: File data not available
      </div>
    );
  }

  return (
    <Link
      href={file.url}
      target="_blank"
      className="file-card block rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow p-4"
      aria-label={`View file ${file.name}`}
    >
      <div className="flex justify-between items-start gap-4">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
          aria-label={`Thumbnail for ${file.name}`}
        />
        <div className="flex flex-col items-end justify-between gap-2">
          <ActionDropdown file={file} />
          <p className="body-1 text-gray-600 dark:text-gray-300">
            {convertFileSize(file.size) || "Unknown size"}
          </p>
        </div>
      </div>
      <div className="file-card-details mt-3 space-y-1">
        <p
          className="subtitle-2 line-clamp-1 font-medium text-gray-900 dark:text-white"
          title={file.name}
        >
          {file.name || "Unnamed file"}
        </p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100 dark:text-gray-400"
          aria-label={`Created on ${file.$createdAt}`}
        />
        <p
          className="caption line-clamp-1 text-light-200 dark:text-gray-500"
          title={file.owner?.fullName}
        >
          By: {file.owner?.fullName || "Unknown owner"}
        </p>
      </div>
    </Link>
  );
};

export default Card;
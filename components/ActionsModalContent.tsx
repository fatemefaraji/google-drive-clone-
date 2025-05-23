import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Define TypeScript interface for file to ensure type safety
interface AppwriteFile extends Models.Document {
  name: string;
  extension: string;
  size: number;
  url: string;
  type: string;
  owner: { fullName: string };
  users: string[];
  $createdAt: string;
  $updatedAt: string;
}

// ImageThumbnail Component
interface ImageThumbnailProps {
  file: AppwriteFile;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ file }) => (
  <div className="file-details-thumbnail flex items-center gap-3">
    <Thumbnail
      type={file.type}
      extension={file.extension}
      url={file.url}
      aria-label={`Thumbnail for ${file.name}`}
    />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1 font-medium">{file.name}</p>
      <FormattedDateTime
        date={file.$createdAt}
        className="caption text-gray-500"
        aria-label={`Created on ${formatDateTime(file.$createdAt)}`}
      />
    </div>
  </div>
);

// DetailRow Component
interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex gap-4 py-1">
    <p className="file-details-label text-left font-semibold w-24">{label}</p>
    <p className="file-details-value text-left">{value || "N/A"}</p>
  </div>
);

// FileDetails Component
interface FileDetailsProps {
  file: AppwriteFile;
}

export const FileDetails: React.FC<FileDetailsProps> = ({ file }) => {
  // Fallback for missing file data
  if (!file) {
    return <div className="text-red-500">Error: File data not available</div>;
  }

  return (
    <div className="file-details-container">
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner?.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </div>
  );
};

// ShareInput Component
interface ShareInputProps {
  file: AppwriteFile;
  onInputChange: (emails: string[]) => void;
  onRemove: (email: string) => void;
}

export const ShareInput: React.FC<ShareInputProps> = ({
  file,
  onInputChange,
  onRemove,
}) => {
  const [emailInput, setEmailInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Validate email format
  const validateEmails = (emails: string[]): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email));
  };

  // Handle email input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.trim();
      setEmailInput(input);

      if (!input) {
        setError(null);
        onInputChange([]);
        return;
      }

      const emails = input.split(",").map((email) => email.trim()).filter(Boolean);
      if (!validateEmails(emails)) {
        setError("Please enter valid email addresses");
        return;
      }

      setError(null);
      onInputChange(emails);
    },
    [onInputChange]
  );

  // Handle remove user with loading state
  const handleRemove = useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        await onRemove(email);
      } catch (err) {
        setError("Failed to remove user");
      } finally {
        setIsLoading(false);
      }
    },
    [onRemove]
  );

  // Fallback for missing file data
  if (!file) {
    return <div className="text-red-500">Error: File data not available</div>;
  }

  return (
    <div className="share-container">
      <ImageThumbnail file={file} />
      <div className="share-wrapper p-4">
        <p className="subtitle-2 pl-1 text-light-100 mb-2">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email addresses (comma-separated)"
          value={emailInput}
          onChange={handleInputChange}
          className="share-input-field"
          aria-describedby="email-error"
          disabled={isLoading}
        />
        {error && (
          <p id="email-error" className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}
        <div className="pt-4">
          <div className="flex justify-between items-center">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} {file.users.length === 1 ? "user" : "users"}
            </p>
          </div>
          {file.users.length > 0 ? (
            <ul className="pt-2 space-y-2">
              {file.users.map((email: string) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="subtitle-2 truncate">{email}</p>
                  <Button
                    onClick={() => handleRemove(email)}
                    className="share-remove-user"
                    aria-label={`Remove ${email} from shared users`}
                    disabled={isLoading}
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      alt="Remove user"
                      width={24}
                      height={24}
                      className="remove-icon"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm pt-2">No users shared yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
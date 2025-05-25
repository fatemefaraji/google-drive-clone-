"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import Thumbnail from "@/components/Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

// Define TypeScript interfaces
interface FileType {
  type: string;
  extension: string;
}

interface Props {
  ownerId: string;
  accountId: string;
  className?: string;
}

const FileUploader: React.FC<Props> = ({ ownerId, accountId, className }) => {
  const path = usePathname();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setIsUploading(true);
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large. Max file size is {convertFileSize(MAX_FILE_SIZE)}.
              </p>
            ),
            className: "error-toast bg-red-600",
            duration: 5000,
          });
          return false;
        }

        try {
          const uploadedFile = await uploadFile({ file, ownerId, accountId, path });
          if (uploadedFile) {
            setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
            toast({
              description: (
                <p className="body-2 text-white">
                  <span className="font-semibold">{file.name}</span> uploaded successfully.
                </p>
              ),
              className: "success-toast bg-green-600",
              duration: 3000,
            });
            return true;
          }
          throw new Error("Upload failed");
        } catch (error: any) {
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
          toast({
            description: (
              <p className="body-2 text-white">
                Failed to upload <span className="font-semibold">{file.name}</span>: {error.message || "Unknown error"}
              </p>
            ),
            className: "error-toast bg-red-600",
            duration: 5000,
          });
          return false;
        }
      });

      await Promise.all(uploadPromises);
      setIsUploading(false);
    },
    [files, ownerId, accountId, path, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".csv"],
      "video/*": [".mp4", ".mov"],
    },
    disabled: isUploading,
  });

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, fileName: string) => {
      e.stopPropagation();
      setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    },
    []
  );

  return (
    <div
      {...getRootProps()}
      className={cn(
        "uploader-container rounded-lg border-2 border-dashed p-4 transition-colors",
        isDragActive ? "border-brand bg-brand/10" : "border-gray-300 dark:border-gray-600",
        isUploading && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label="File upload dropzone"
    >
      <input {...getInputProps()} aria-label="File input" />
      <Button
        type="button"
        className={cn("uploader-button flex items-center gap-2 bg-brand hover:bg-brand-dark", className)}
        disabled={isUploading}
        aria-label="Upload files"
      >
        <Image
          src="/assets/icons/upload.svg"
          alt=""
          width={24}
          height={24}
          className="fill-current"
        />
        <span>Upload</span>
      </Button>
      {files.length > 0 && (
        <ul className="uploader-preview-list mt-4 space-y-3" aria-label="Uploading files list">
          <h4 className="h4 text-light-100 font-semibold">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension }: FileType = getFileType(file.name);
            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                    className="!size-12"
                    imageClassName="!size-8"
                    aria-label={`Preview for ${file.name}`}
                  />
                  <div className="preview-item-name flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
                    <Image
                      src="/assets/icons/file-loader.gif"
                      width={80}
                      height={26}
                      alt="Loading"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={isUploading}
                  aria-label={`Remove ${file.name}`}
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    width={24}
                    height={24}
                    alt=""
                  />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
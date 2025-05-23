"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";

// Define TypeScript interfaces
interface AppwriteFile extends Models.Document {
  name: string;
  extension: string;
  bucketFileId: string;
  owner: { fullName: string };
  users: string[];
}

interface ActionType {
  value: string;
  label: string;
  icon: string;
}

interface ActionDropdownProps {
  file: AppwriteFile;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ file }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const path = usePathname();

  const closeAllModals = useCallback(() => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setError(null);
  }, [file.name]);

  const handleAction = useCallback(async () => {
    if (!action) return;
    setIsLoading(true);
    setError(null);

    try {
      const actions = {
        rename: () =>
          renameFile({ fileId: file.$id, name, extension: file.extension, path }),
        share: () => updateFileUsers({ fileId: file.$id, emails, path }),
        delete: () =>
          deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
      };

      const success = await actions[action.value as keyof typeof actions]();
      if (success) {
        closeAllModals();
      } else {
        setError(`Failed to ${action.value} file`);
      }
    } catch (err) {
      setError(`Error: ${action.value} action failed`);
    } finally {
      setIsLoading(false);
    }
  }, [action, file, name, emails, path, closeAllModals]);

  const handleRemoveUser = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedEmails = file.users.filter((e) => e !== email);
        const success = await updateFileUsers({
          fileId: file.$id,
          emails: updatedEmails,
          path,
        });

        if (success) {
          setEmails(updatedEmails);
        } else {
          setError("Failed to remove user");
        }
      } catch (err) {
        setError("Error removing user");
      } finally {
        setIsLoading(false);
      }
    },
    [file.$id, file.users, path]
  );

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog max-w-md" aria-describedby="dialog-description">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          <p id="dialog-description" className="sr-only">
            {`Dialog for ${label.toLowerCase()} action on file ${file.name}`}
          </p>
          {value === "rename" && (
            <>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
                placeholder="Enter file name"
                aria-label="Rename file"
                disabled={isLoading}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </>
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <>
              <p className="delete-confirmation text-center">
                Are you sure you want to delete{` `}
                <span className="delete-file-name font-semibold">{file.name}</span>?
              </p>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={closeAllModals}
              className="modal-cancel-button"
              disabled={isLoading}
              aria-label="Cancel action"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className="modal-submit-button"
              disabled={isLoading || (value === "rename" && !name.trim())}
              aria-label={`${value} file`}
            >
              <span className="capitalize">{value}</span>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="Loading"
                  width={24}
                  height={24}
                  className="animate-spin ml-2"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  // Fallback for missing file data
  if (!file) {
    return <div className="text-red-500">Error: File data not available</div>;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus" aria-label="Open file actions menu">
          <Image
            src="/assets/icons/dots.svg"
            alt="File actions"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-[200px]">
          <DropdownMenuLabel className="truncate font-semibold">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item hover:bg-gray-100"
              onClick={() => {
                setAction(actionItem);
                if (["rename", "share", "delete", "details"].includes(actionItem.value)) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketFileId)}
                  download={file.name}
                  className="flex items-center gap-2 w-full"
                  aria-label={`Download ${file.name}`}
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={24}
                    height={24}
                  />
                  <span>{actionItem.label}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={24}
                    height={24}
                  />
                  <span>{actionItem.label}</span>
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
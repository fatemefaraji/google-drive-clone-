"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface NavItem {
  url: string;
  name: string;
  icon: string;
}

interface SidebarProps {
  fullName: string;
  avatar: string;
  email: string;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ fullName, avatar, email, className }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sidebar flex flex-col h-screen bg-white dark:bg-gray-800 shadow-md lg:w-64 w-20 p-4",
        className
      )}
      aria-label="Sidebar navigation"
    >
      <Link href="/" className="mb-8">
        <Image
          src="/assets/icons/logo-full-brand.svg"
          alt="Application logo"
          width={160}
          height={50}
          className="hidden h-auto lg:block"
        />
        <Image
          src="/assets/icons/logo-brand.svg"
          alt="Application logo"
          width={52}
          height={52}
          className="lg:hidden mx-auto"
        />
      </Link>

      <nav className="sidebar-nav flex-1">
        <ul className="flex flex-col gap-4">
          {navItems.map(({ url, name, icon }: NavItem) => (
            <li
              key={name}
              className={cn(
                "sidebar-nav-item flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                pathname === url && "shad-active bg-brand/10"
              )}
            >
              <Link href={url} className="flex items-center gap-3 w-full" aria-label={`Navigate to ${name}`}>
                <Image
                  src={icon}
                  alt=""
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon fill-current",
                    pathname === url && "nav-icon-active text-brand"
                  )}
                />
                <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white">
                  {name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Image
        src="/assets/images/files-2.png"
        alt="Decorative files illustration"
        width={506}
        height={418}
        className="w-full hidden lg:block mb-4"
        priority={false}
      />

      <div className="sidebar-user-info flex items-center gap-3">
        <Image
          src={avatar || "/assets/icons/default-avatar.svg"}
          alt={`${fullName || "User"}'s avatar`}
          width={44}
          height={44}
          className="sidebar-user-avatar rounded-full"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize font-semibold text-gray-900 dark:text-white">
            {fullName || "Unknown User"}
          </p>
          <p className="caption text-gray-500 dark:text-gray-400">{email || "No email"}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
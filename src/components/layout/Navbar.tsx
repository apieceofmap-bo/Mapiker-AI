"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/catalog", label: "Catalog" },
    { href: "/project/new", label: "New Project" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-[#e9e9e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo and Nav Links */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Mapiker-AI" width={150} height={40} />
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-[rgba(55,53,47,0.08)] text-[#37352f]"
                      : "text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.04)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {!loading && user && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-[#37352f]">
                    {user.email?.split("@")[0]}
                  </span>
                  <span className="text-xs text-[#9b9a97]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm font-medium text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.04)] rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="sm:hidden border-t border-[#e9e9e7]">
        <div className="flex space-x-1 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-[rgba(55,53,47,0.08)] text-[#37352f]"
                  : "text-[#787774] hover:text-[#37352f] hover:bg-[rgba(55,53,47,0.04)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

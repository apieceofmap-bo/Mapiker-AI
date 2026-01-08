"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/project/new", label: "New Project" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold text-gray-800"
            >
              <span className="text-2xl">🗺️</span>
              <span className="hidden sm:inline">Mapiker-AI</span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {!loading && user && (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split("@")[0]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex space-x-1 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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

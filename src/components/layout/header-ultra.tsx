/**
 * Ultra Design System - Compact Header with Integrated Navigation
 * No wasted space, maximum efficiency
 */
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Plus,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UltraButton, UltraGradientButton } from "@/components/ui/ultra-button";

export const HeaderUltra: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/protocols", label: "Protocolos", icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/95">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="group flex items-center space-x-3"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
                <div className="relative rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 p-2 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  Protocolos Médicos
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-3 w-3" />
                  Ultra Design System
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                      "flex items-center gap-2",
                      active
                        ? "bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-500/25"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Actions and User */}
          <div className="flex items-center gap-4">
            {/* Quick Action Button */}
            {pathname.startsWith("/protocols") && (
              <Link href="/protocols/new" className="hidden sm:flex">
                <UltraGradientButton
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Novo Protocolo
                </UltraGradientButton>
              </Link>
            )}

            {/* User Menu */}
            {isLoading ? (
              <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    userMenuOpen && "bg-gray-100 dark:bg-gray-700",
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 text-sm font-medium text-white">
                    {user.name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">
                    {user.name || user.email}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-500 transition-transform duration-300",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Conectado como
                      </p>
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <UltraButton variant="ghost" size="sm">
                  Login
                </UltraButton>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-gray-200 py-4 dark:border-gray-700 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
                      "flex items-center gap-3",
                      active
                        ? "bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 dark:from-primary-900/20 dark:to-indigo-900/20 dark:text-primary-300"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              {pathname.startsWith("/protocols") && (
                <Link
                  href="/protocols/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary-500 to-indigo-600 px-4 py-3 text-sm font-medium text-white"
                >
                  <Plus className="h-5 w-5" />
                  Novo Protocolo
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

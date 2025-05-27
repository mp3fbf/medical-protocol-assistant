/**
 * Header component for the main application layout.
 * Displays application title, navigation, and user actions.
 */
"use client";
import React from "react";
import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth hook is available
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"; // shadcn button

export const Header: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          {/* <IconHospital className="h-6 w-6 text-primary-500" /> Replace with actual logo/icon */}
          <span className="text-lg font-semibold text-primary-700">
            Protocolos Médicos
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200"></div>
          ) : isAuthenticated && user ? (
            <>
              <span className="flex items-center text-sm text-gray-600">
                <UserCircle className="mr-2 h-5 w-5 text-primary-500" />
                {user.name || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-primary-500"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

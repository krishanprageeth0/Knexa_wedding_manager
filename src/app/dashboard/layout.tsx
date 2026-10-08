"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div suppressHydrationWarning className="flex h-screen items-center justify-center bg-ivory">Loading...</div>;
  }

  if (!user) {
    return null; // will redirect
  }

  return (
    <div suppressHydrationWarning className="flex flex-1 h-screen overflow-hidden bg-ivory">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-sage-green/10 rounded-full blur-3xl pointer-events-none" />
        {children}
      </main>
    </div>
  );
}

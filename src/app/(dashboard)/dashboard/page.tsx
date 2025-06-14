// app/dashboard/page.tsx
"use client";

import React from "react";

import { ToastProvider } from "@/hooks/use-toast";
// import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MainDashboard } from "@/components/dashboard/main-dashboard";

export default function DashboardPage() {
  return (
    <ToastProvider>
      {/*<ErrorBoundary>*/}
      <MainDashboard />
      {/*</ErrorBoundary>*/}
    </ToastProvider>
  );
}

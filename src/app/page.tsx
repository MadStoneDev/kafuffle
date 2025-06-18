// /app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Import AppContainer with SSR disabled
const AppContainer = dynamic(
  () => import("@/components/layout/app-container"),
  {
    ssr: false, // This completely disables server-side rendering for AppContainer
    loading: () => (
      <main className="p-3 flex gap-3 h-screen bg-black">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-base">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading Kafuffle...
            </div>
          </div>
        </div>
      </main>
    ),
  },
);

export default function Home() {
  return <AppContainer />;
}

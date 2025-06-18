"use client";

import { useNavigation } from "@/providers/navigation-provider";

export default function NavigationDebug() {
  const { navigationStack, canGoBack, currentView, selectedSpaceId } =
    useNavigation();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">Navigation Debug</div>
      <div>Current View: {currentView}</div>
      <div>Selected Space: {selectedSpaceId || "none"}</div>
      <div>Can Go Back: {canGoBack ? "Yes" : "No"}</div>
      <div>Stack Length: {navigationStack.length}</div>
      <div className="mt-2 text-xs opacity-70">
        Stack:{" "}
        {navigationStack.map((item, i) => (
          <div key={i}>
            {i}: {item.currentView} - {item.selectedSpaceId || "no space"}
          </div>
        ))}
      </div>
    </div>
  );
}

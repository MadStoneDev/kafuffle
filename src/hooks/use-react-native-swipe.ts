// /hooks/use-react-native-swipe.ts
import { useEffect, useRef, useCallback } from "react";

interface SwipeConfig {
  onOpenLeft?: () => void; // Open left sidebar (navigate)
  onOpenRight?: () => void; // Open right sidebar (context)
  onCloseLeft?: () => void; // Close left sidebar
  onCloseRight?: () => void; // Close right sidebar
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  edgeSize?: number;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

export function useReactNativeSwipe({
  onOpenLeft,
  onOpenRight,
  onCloseLeft,
  onCloseRight,
  leftSidebarOpen,
  rightSidebarOpen,
  edgeSize = 30,
  minSwipeDistance = 80,
  maxSwipeTime = 400,
}: SwipeConfig) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isEdgeSwipe = useRef<boolean>(false);
  const swipeOrigin = useRef<"edge" | "sidebar" | "content">("content");

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const startX = e.touches[0].clientX;
      const startY = e.touches[0].clientY;
      const screenWidth = window.innerWidth;

      touchStartX.current = startX;
      touchStartY.current = startY;
      touchStartTime.current = Date.now();

      // Determine swipe origin
      if (startX <= edgeSize) {
        swipeOrigin.current = "edge";
        isEdgeSwipe.current = true;
      } else if (startX >= screenWidth - edgeSize) {
        swipeOrigin.current = "edge";
        isEdgeSwipe.current = true;
      } else if (leftSidebarOpen && startX <= 250) {
        // Assuming sidebar width ~250px
        swipeOrigin.current = "sidebar";
        isEdgeSwipe.current = false;
      } else if (rightSidebarOpen && startX >= screenWidth - 250) {
        swipeOrigin.current = "sidebar";
        isEdgeSwipe.current = false;
      } else {
        swipeOrigin.current = "content";
        isEdgeSwipe.current = false;
      }
    },
    [edgeSize, leftSidebarOpen, rightSidebarOpen],
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Prevent scrolling during edge swipes
    if (isEdgeSwipe.current && swipeOrigin.current === "edge") {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (
        touchStartX.current === null ||
        touchStartY.current === null ||
        touchStartTime.current === null
      )
        return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const deltaTime = touchEndTime - touchStartTime.current;
      const screenWidth = window.innerWidth;

      // Check if it's a horizontal swipe (not vertical scroll)
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Reset and return
        touchStartX.current = null;
        touchStartY.current = null;
        touchStartTime.current = null;
        isEdgeSwipe.current = false;
        return;
      }

      // Check minimum distance and maximum time
      if (Math.abs(deltaX) < minSwipeDistance || deltaTime > maxSwipeTime) {
        // Reset and return
        touchStartX.current = null;
        touchStartY.current = null;
        touchStartTime.current = null;
        isEdgeSwipe.current = false;
        return;
      }

      // Debug logging
      console.log("Swipe detected:", {
        origin: swipeOrigin.current,
        deltaX,
        startX: touchStartX.current,
        endX: touchEndX,
        leftOpen: leftSidebarOpen,
        rightOpen: rightSidebarOpen,
      });

      // Handle different swipe scenarios
      if (swipeOrigin.current === "edge") {
        // Edge swipes - opening sidebars
        if (touchStartX.current <= edgeSize && deltaX > 0) {
          // Right swipe from left edge - open left sidebar
          onOpenLeft?.();
        } else if (
          touchStartX.current >= screenWidth - edgeSize &&
          deltaX < 0
        ) {
          // Left swipe from right edge - open right sidebar
          onOpenRight?.();
        }
      } else if (swipeOrigin.current === "sidebar") {
        // Swipes starting from within sidebar area
        if (leftSidebarOpen && deltaX < 0) {
          // Left swipe from left sidebar - close it
          onCloseLeft?.();
        } else if (rightSidebarOpen && deltaX > 0) {
          // Right swipe from right sidebar - close it
          onCloseRight?.();
        }
      } else if (swipeOrigin.current === "content") {
        // Swipes from content area when sidebars are open
        if (leftSidebarOpen && deltaX < 0) {
          // Left swipe in content - close left sidebar
          onCloseLeft?.();
        } else if (rightSidebarOpen && deltaX > 0) {
          // Right swipe in content - close right sidebar
          onCloseRight?.();
        } else if (!leftSidebarOpen && !rightSidebarOpen) {
          // No sidebars open - might want to open based on swipe direction
          if (deltaX > minSwipeDistance) {
            onOpenLeft?.();
          } else if (deltaX < -minSwipeDistance) {
            onOpenRight?.();
          }
        }
      }

      // Reset
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      isEdgeSwipe.current = false;
    },
    [
      onOpenLeft,
      onOpenRight,
      onCloseLeft,
      onCloseRight,
      leftSidebarOpen,
      rightSidebarOpen,
      edgeSize,
      minSwipeDistance,
      maxSwipeTime,
    ],
  );

  useEffect(() => {
    // Add both touch and mouse listeners for testing
    if (typeof window !== "undefined") {
      // Mouse events (for testing on desktop)
      const handleMouseStart = (e: MouseEvent) => {
        const fakeTouch = {
          touches: [{ clientX: e.clientX, clientY: e.clientY }],
        } as unknown as TouchEvent;
        handleTouchStart(fakeTouch);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (touchStartX.current !== null) {
          // Only if we're "dragging"
          const fakeTouch = {
            preventDefault: () => e.preventDefault(),
          } as unknown as TouchEvent;
          handleTouchMove(fakeTouch);
        }
      };

      const handleMouseEnd = (e: MouseEvent) => {
        if (touchStartX.current !== null) {
          // Only if we were "dragging"
          const fakeTouch = {
            changedTouches: [{ clientX: e.clientX, clientY: e.clientY }],
          } as unknown as TouchEvent;
          handleTouchEnd(fakeTouch);
        }
      };

      // Touch events (mobile)
      document.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });

      // Mouse events
      document.addEventListener("mousedown", handleMouseStart);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseEnd);

      return () => {
        // Remove touch listeners
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);

        // Remove mouse listeners
        document.removeEventListener("mousedown", handleMouseStart);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseEnd);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}

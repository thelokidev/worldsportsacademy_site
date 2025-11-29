"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Online status indicator that shows when the user goes offline
 * Displays a toast-like notification when connectivity changes
 */
export function OnlineStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);
    
    // Prevent showing indicator on initial load
    const timer = setTimeout(() => setInitialLoad(false), 1000);

    const handleOnline = () => {
      setIsOnline(true);
      if (!initialLoad) {
        setShowIndicator(true);
        // Hide the "back online" indicator after 3 seconds
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!initialLoad) {
        setShowIndicator(true);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [initialLoad]);

  // Show indicator when offline or when showing reconnection message
  if (!showIndicator && isOnline) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xl border transition-colors duration-300 ${
          isOnline
            ? "bg-green-500/10 border-green-500/20 text-green-500"
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You&apos;re offline</span>
          </>
        )}
      </div>
    </div>
  );
}


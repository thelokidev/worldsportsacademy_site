"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAUpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Get the current registration
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setRegistration(reg);

          // Check for waiting service worker
          if (reg.waiting) {
            setShowNotification(true);
          }

          // Listen for new service worker
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setShowNotification(true);
                }
              });
            }
          });
        }
      });

      // Handle controller change (when new SW takes over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setShowNotification(false);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-update-dismissed", "true");
  }, []);

  // Check if already dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa-update-dismissed");
    if (dismissed) {
      setShowNotification(false);
    }
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top duration-300">
      <div className="relative bg-gradient-to-r from-orange-500/10 to-orange-600/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/30 animate-pulse" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-800/50 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="relative p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">
                Update Available
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                A new version of World Sports Academy is ready. Update now for the latest features and improvements.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="flex-1 h-9 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium text-xs rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Update Now
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="h-9 px-4 bg-transparent border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-400 font-medium text-xs rounded-lg"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


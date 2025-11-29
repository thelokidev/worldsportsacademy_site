"use client";

import { useState, useEffect, useCallback } from "react";

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  isInstallable: boolean;
}

interface UsePWAReturn {
  status: PWAStatus;
  promptInstall: () => Promise<boolean>;
  updateServiceWorker: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Hook to manage PWA functionality
 * Provides install prompt, online status, and update management
 */
export function usePWA(): UsePWAReturn {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    isUpdateAvailable: false,
    isInstallable: false,
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ||
        document.referrer.includes("android-app://");
      
      setStatus(prev => ({ ...prev, isInstalled: isStandalone }));
    };

    // Check online status
    const updateOnlineStatus = () => {
      setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Handle beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, isInstallable: true }));
    };

    // Handle appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setStatus(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
    };

    // Register service worker and check for updates
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            setRegistration(reg);

            // Check for updates
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      }
    };

    checkInstalled();
    updateOnlineStatus();
    registerServiceWorker();

    // Event listeners
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", checkInstalled);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", checkInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setStatus(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setStatus(prev => ({ ...prev, isUpdateAvailable: false }));
      window.location.reload();
    }
  }, [registration]);

  return {
    status,
    promptInstall,
    updateServiceWorker,
  };
}


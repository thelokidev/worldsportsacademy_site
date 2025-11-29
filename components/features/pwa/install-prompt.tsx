"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share, Plus, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if running as standalone (already installed)
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
    };

    // Check if iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
    };

    checkStandalone();
    checkIOS();

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user dismissed recently
      const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
      if (dismissedAt) {
        const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
        if (hoursSinceDismissed < 24) return; // Don't show for 24 hours after dismissal
      }
      
      // Delay showing the prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstallSuccess(false), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show iOS prompt if conditions are met
    if (!isStandalone) {
      const iosPromptDismissed = localStorage.getItem("ios-pwa-prompt-dismissed");
      if (iosPromptDismissed) {
        const daysSinceDismissed = (Date.now() - parseInt(iosPromptDismissed)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed >= 7) {
          setTimeout(() => setShowPrompt(true), 5000);
        }
      } else {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallSuccess(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem("ios-pwa-prompt-dismissed", Date.now().toString());
    } else {
      localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    }
  }, [isIOS]);

  // Don't render if already installed
  if (isStandalone) return null;

  // Success toast
  if (installSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-green-500">App Installed!</p>
              <p className="text-sm text-green-400/80">World Sports Academy is ready to use</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt) return null;

  // iOS Instructions Modal
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>

          <div className="p-6 pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#50C878]/20 to-[#3DA860]/10 border border-[#50C878]/20">
                <Smartphone className="w-10 h-10 text-[#50C878]" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-2">
              Install on iOS
            </h2>
            <p className="text-neutral-400 text-center text-sm mb-6">
              Follow these simple steps to add World Sports Academy to your home screen
            </p>

            <div className="space-y-4">
              <InstallStep
                step={1}
                icon={<Share className="w-5 h-5" />}
                title="Tap the Share button"
                description="Located at the bottom of your Safari browser"
              />
              <InstallStep
                step={2}
                icon={<Plus className="w-5 h-5" />}
                title='Select "Add to Home Screen"'
                description="Scroll down in the share menu to find this option"
              />
              <InstallStep
                step={3}
                icon={<CheckCircle2 className="w-5 h-5" />}
                title='Tap "Add" to confirm'
                description="The app will appear on your home screen"
              />
            </div>

            <Button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 h-12 bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-semibold rounded-xl"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main install prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="relative bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D5B4A] to-[#50C878]" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>

        <div className="p-4 pt-5">
          <div className="flex items-start gap-4">
            {/* App icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center overflow-hidden">
                <img
                  src="/icons/icon-96x96.png"
                  alt="World Sports Academy"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">
                Install World Sports Academy
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Get quick access and a native app experience
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
              Faster loading
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#50C878]" />
              Push notifications
            </span>
          </div>

          {/* Action button */}
          <div className="mt-4">
            {isIOS ? (
              <Button
                onClick={() => setShowIOSInstructions(true)}
                className="w-full h-10 bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-medium text-sm rounded-xl"
              >
                <Share className="w-4 h-4 mr-2" />
                How to Install
              </Button>
            ) : (
              <Button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full h-10 bg-gradient-to-r from-[#50C878] to-[#3DA860] hover:from-[#3DA860] hover:to-[#50C878] text-white font-medium text-sm rounded-xl disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InstallStepProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InstallStep({ step, icon, title, description }: InstallStepProps) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl bg-neutral-800/50">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#50C878]/20 flex items-center justify-center text-[#50C878] font-semibold text-sm">
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[#50C878]">{icon}</span>
          <span className="font-medium text-white text-sm">{title}</span>
        </div>
        <p className="text-neutral-400 text-xs">{description}</p>
      </div>
    </div>
  );
}


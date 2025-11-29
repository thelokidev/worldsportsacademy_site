"use client";

import { WifiOff, RefreshCw, Home, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-orange-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Icon animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-full border border-neutral-700/50 shadow-2xl">
              <WifiOff className="w-16 h-16 text-orange-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            You&apos;re Offline
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry, 
            some features are still available offline.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 mb-10">
          <Button
            onClick={handleRetry}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 hover:shadow-orange-500/30 hover:scale-[1.02]"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full h-12 bg-transparent border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-300 font-medium rounded-xl transition-all duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Offline features */}
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800 p-6">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Available Offline
          </h2>
          <div className="space-y-3">
            <OfflineFeature
              icon={<Calendar className="w-5 h-5" />}
              title="View Cached Bookings"
              description="See your previously loaded bookings"
            />
            <OfflineFeature
              icon={<Trophy className="w-5 h-5" />}
              title="Browse Programs"
              description="Explore sports programs you've visited"
            />
          </div>
        </div>

        {/* Footer tip */}
        <p className="text-center text-neutral-500 text-sm mt-8">
          💡 Tip: Enable notifications to stay updated when you&apos;re back online
        </p>
      </div>
    </div>
  );
}

interface OfflineFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function OfflineFeature({ icon, title, description }: OfflineFeatureProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors">
      <div className="flex-shrink-0 p-2 rounded-lg bg-orange-500/10 text-orange-500">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white text-sm">{title}</h3>
        <p className="text-neutral-500 text-xs">{description}</p>
      </div>
    </div>
  );
}


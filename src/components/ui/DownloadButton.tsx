"use client";

import { Download } from "lucide-react";
import { useRelease } from "@/hooks/useRelease";

interface DownloadButtonProps {
  className?: string;
  size?: "default" | "large";
}

export default function DownloadButton({ className = "", size = "default" }: DownloadButtonProps) {
  const { version, downloadUrl, isLoading } = useRelease();

  const sizeClasses = size === "large"
    ? "px-8 py-4 text-lg min-h-[52px]"
    : "px-6 py-3 text-base min-h-[44px]";

  return (
    <a
      href={downloadUrl}
      className={`inline-flex items-center justify-center gap-2 rounded-full gradient-bg font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] ${sizeClasses} ${className}`}
      download
    >
      <Download className="h-5 w-5" aria-hidden="true" />
      {isLoading ? (
        "Download Free"
      ) : (
        <>Download Free {version && <span className="opacity-80">({version})</span>}</>
      )}
    </a>
  );
}

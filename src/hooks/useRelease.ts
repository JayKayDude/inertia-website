"use client";

import { useState, useEffect } from "react";
import { GITHUB_URL } from "@/lib/constants";

interface ReleaseData {
  version: string | null;
  downloadUrl: string;
  isLoading: boolean;
}

export function useRelease(): ReleaseData {
  const [version, setVersion] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState(`${GITHUB_URL}/releases/latest`);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/release")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch release");
        return res.json();
      })
      .then((data) => {
        setVersion(data.version);
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
        }
      })
      .catch(() => {
        // Fallback to GitHub releases page
        setDownloadUrl(`${GITHUB_URL}/releases/latest`);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { version, downloadUrl, isLoading };
}

import { NextResponse } from "next/server";
import { RELEASE_API_URL, ASSET_NAME, GITHUB_URL } from "@/lib/constants";

export const revalidate = 3600; // ISR: re-fetch hourly

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "inertia-website",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(RELEASE_API_URL, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`);
    }

    const release = await res.json();

    // Find the app asset by exact name match
    const asset = release.assets?.find(
      (a: { name: string }) => a.name === ASSET_NAME
    );

    // Validate download URL belongs to our repo
    const downloadUrl = asset?.browser_download_url;
    const trustedPrefix = `${GITHUB_URL}/releases/download/`;
    const safeUrl = downloadUrl?.startsWith(trustedPrefix)
      ? downloadUrl
      : `${GITHUB_URL}/releases/latest`;

    return NextResponse.json({
      version: release.tag_name || null,
      downloadUrl: safeUrl,
      publishedAt: release.published_at || null,
      size: asset?.size || null,
    });
  } catch {
    // Fallback response
    return NextResponse.json({
      version: null,
      downloadUrl: `${GITHUB_URL}/releases/latest`,
      publishedAt: null,
      size: null,
    });
  }
}

import { NextResponse } from "next/server";
import { RELEASE_API_URL, ASSET_NAME, GITHUB_URL } from "@/lib/constants";

export const revalidate = 3600; // ISR: re-fetch hourly

export async function GET() {
  try {
    const res = await fetch(RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "inertia-website",
      },
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

    return NextResponse.json({
      version: release.tag_name || null,
      downloadUrl: asset?.browser_download_url || `${GITHUB_URL}/releases/latest`,
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

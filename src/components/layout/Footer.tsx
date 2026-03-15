import Image from "next/image";
import { Github } from "lucide-react";
import { GITHUB_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950" role="contentinfo">
      {/* Tri-gradient divider */}
      <div
        className="mx-auto h-px w-48 rounded-full"
        style={{
          background: "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Branded sign-off */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/app-icon.png"
              alt=""
              width={32}
              height={32}
              className="rounded-lg"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Inertia
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Smooth scrolling for macOS.
          </p>
        </div>

        {/* Links row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Inertia. Open source under MIT License.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center text-sm text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100"
            >
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

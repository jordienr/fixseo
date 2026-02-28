"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageManager = "pnpm" | "npm" | "bun";

const PM_STORAGE_KEY = "docs-preferred-pm";

const PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "bun"];

interface CodeBlockProps {
  /** A record of package-manager → command string, OR a plain string for non-PM blocks */
  code: Record<PackageManager, string> | string;
  /** Optional language label shown for non-PM blocks */
  language?: string;
  className?: string;
}

function getStoredPM(): PackageManager {
  if (typeof window === "undefined") return "bun";
  try {
    const stored = localStorage.getItem(PM_STORAGE_KEY);
    if (stored && PACKAGE_MANAGERS.includes(stored as PackageManager)) {
      return stored as PackageManager;
    }
  } catch {}
  return "bun";
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [pm, setPm] = useState<PackageManager>("bun");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPm(getStoredPM());
    setMounted(true);
  }, []);

  const hasPmPicker = typeof code !== "string";

  const selectPm = useCallback((next: PackageManager) => {
    setPm(next);
    try {
      localStorage.setItem(PM_STORAGE_KEY, next);
    } catch {}
  }, []);

  const displayCode = useMemo(
    () => (typeof code === "string" ? code : code[pm]),
    [code, pm],
  );

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [displayCode]);

  if (!mounted) {
    return (
      <div className={cn("overflow-hidden rounded-lg bg-muted/50", className)}>
        <div className="h-10 border-b border-border bg-muted/30" />
        <div className="p-4">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg bg-muted/50", className)}>
      {/* Toolbar */}
      <div className="flex border-b border-muted items-center justify-between pr-1 pl-1.5">
        <div className="flex items-center gap-2">
          {/* PM tabs or language label */}
          {hasPmPicker ? (
            <div className="flex items-center h-full py-1.5">
              {PACKAGE_MANAGERS.map((manager) => (
                <button
                  key={manager}
                  onClick={() => selectPm(manager)}
                  className={cn(
                    "relative cursor-pointer px-2 py-1 text-sm font-medium transition-colors rounded-sm",
                    pm === manager
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground/80",
                  )}
                >
                  {manager}
                </button>
              ))}
            </div>
          ) : language ? (
            <span className="px-1 py-2.5 text-sm font-medium text-muted-foreground">
              {language}
            </span>
          ) : null}
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="px-4 py-2 max-h-100 overflow-auto">
        <pre className="text-sm leading-relaxed">
          <code className="font-mono text-foreground">{displayCode}</code>
        </pre>
      </div>
    </div>
  );
}

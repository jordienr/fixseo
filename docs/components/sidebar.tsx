"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Guides",
      items: [
        { title: "Introduction", href: "/" },
        { title: "CLI", href: "/docs/cli" },
        { title: "Claude Code", href: "/docs/claude-code" },
        { title: "OpenCode", href: "/docs/opencode" },
      ],
    },
  ];

  const isCurrentPath = (href: string) => {
    if (typeof window === "undefined") return false;
    return href === pathname;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card px-4 py-8 transition-transform duration-200 md:relative md:translate-x-0 md:block",
          !isOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="px-2 font-semibold">
            fixseo<span className="text-muted-foreground">.dev</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 font-mono text-xs text-muted-foreground lowercase tracking-wider px-2">
                {section.title}
              </h3>
              <ul className="space-y-px">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "inline-block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                        {
                          "bg-accent text-accent-foreground": isCurrentPath(
                            item.href,
                          ),
                        },
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

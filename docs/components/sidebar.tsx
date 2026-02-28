"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", href: "/" },
        { title: "CLI", href: "/docs/cli" },
        { title: "OpenCode", href: "/docs/opencode" },
      ],
    },
    {
      title: "Guides",
      items: [
        { title: "CLI Usage", href: "/docs/guides/cli" },
        { title: "API Reference", href: "/docs/guides/api" },
      ],
    },
  ];

  const isCurrentPath = (href: string) => {
    if (typeof window === "undefined") return false;
    return href === pathname;
  };

  return (
    <aside className="w-64 border-r bg-card px-4 py-8 hidden md:block">
      <div className="mb-8">
        <Link href="/" className="tracking-tight px-2">
          fixseo<span className="text-muted-foreground">.dev</span>
        </Link>
      </div>
      <nav className="space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-xs text-muted-foreground lowercase tracking-wider px-2">
              {section.title}
            </h3>
            <ul className="space-y-px">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
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
  );
};

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, crumbs, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-2">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: "#3a3830" }} />}
                {c.href ? (
                  <Link href={c.href} className="text-xs transition-colors hover:text-[#e8e8e0]" style={{ color: "#484640" }}>
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-xs" style={{ color: "#626250" }}>{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#f5f5f0" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: "#626250" }}>{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

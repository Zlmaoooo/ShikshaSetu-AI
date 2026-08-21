"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, User, School, AlertTriangle, Users, BookOpenCheck } from "lucide-react";

type Lang = "en" | "as";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("en");

  const navLinks = [
    { href: "/teacher/dashboard", label: lang === "en" ? "Overview" : "সামগ্ৰিক দৃশ্য", icon: School },
    { href: "/teacher/dashboard#at-risk", label: lang === "en" ? "At-Risk Alerts" : "সতৰ্কতা", icon: AlertTriangle },
    { href: "/teacher/dashboard#class-mastery", label: lang === "en" ? "Class Analytics" : "শ্ৰেণী বিশ্লেষণ", icon: Users },
    { href: "/ask", label: lang === "en" ? "Doubt Solver" : "সন্দেহ সমাধান", icon: BookOpenCheck },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border bg-background sticky top-0 z-30 w-full">
        <div className="w-full px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>ShikshaSetu AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary/20 border border-secondary/40 text-foreground ml-1">
                Teacher
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      active
                        ? "bg-primary/20 text-foreground border border-primary/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted border border-border">
              {(["en", "as"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    lang === l
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "en" ? "English" : "অসমীয়া"}
                </button>
              ))}
            </div>

            <div className="h-8.5 w-8.5 rounded-full border border-border bg-secondary/20 flex items-center justify-center text-foreground font-semibold text-xs">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('omniroute-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark')}})();`,
      }}
    />
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const stored = localStorage.getItem("omniroute-theme") as "dark" | "light" | null;
    setTheme(stored ?? "dark");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("omniroute-theme", next);
  }
  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

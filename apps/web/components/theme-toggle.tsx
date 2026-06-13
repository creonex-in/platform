"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2">
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-border/50 bg-background/50 shadow-xl backdrop-blur-md"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <FontAwesomeIcon icon={faSun} className="h-5 w-5 text-foreground" />
        ) : (
          <FontAwesomeIcon icon={faMoon} className="h-5 w-5 text-foreground" />
        )}
      </Button>
    </div>
  );
}

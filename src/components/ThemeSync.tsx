import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePreferences } from "@/hooks/usePreferences";

/**
 * Applies the user's saved theme from preferences as soon as they are loaded.
 * This ensures dark/light mode persists across logout and login without
 * requiring the user to open the Settings page.
 */
export function ThemeSync() {
  const { data: preferences } = usePreferences();
  const { setTheme } = useTheme();

  useEffect(() => {
    const saved = preferences?.appearance?.theme;
    // Default to light if no preference saved or preference is "system"
    const themeToApply = saved && saved !== "system" ? saved : "light";
    setTheme(themeToApply);
  }, [preferences?.appearance?.theme, setTheme]);

  return null;
}

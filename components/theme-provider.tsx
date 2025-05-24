"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps extends React.PropsWithChildren {
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  attribute,
  defaultTheme,
  enableSystem,
  children,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  return React.useContext(NextThemesProviderContext);
}

const NextThemesProviderContext = React.createContext({
  theme: null,
  setTheme: (theme: string) => {},
});

import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProblemPage from "./pages/ProblemPage";
import { usePrefs } from "./hooks/usePrefs";

function TodayRedirect() {
  const today = new Date().toISOString().slice(0, 10);
  return <Navigate to={`/${today}`} replace />;
}

function ThemeApplier() {
  const [prefs] = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = (dark: boolean) =>
        root.setAttribute("data-theme", dark ? "dark" : "light");
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      root.setAttribute("data-theme", prefs.theme);
    }
  }, [prefs.theme]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeApplier />
      <Routes>
        <Route path="/" element={<TodayRedirect />} />
        <Route path="/:date" element={<HomePage />} />
        <Route path="/:date/:lang/:difficulty" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

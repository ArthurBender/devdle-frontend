import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProblemPage from "./pages/ProblemPage";

function TodayRedirect() {
  const today = new Date().toISOString().slice(0, 10);
  return <Navigate to={`/${today}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodayRedirect />} />
        <Route path="/:date" element={<HomePage />} />
        <Route path="/:date/:lang/:difficulty" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

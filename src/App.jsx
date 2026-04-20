import React from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthSuccess from "./pages/AuthSuccess";
import Policy from "./pages/Policy";

export default function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/auth/success") return <AuthSuccess />;
  if (path === "/terms") return <Policy type="terms" />;
  if (path === "/privacy") return <Policy type="privacy" />;

  return <Home />;
}

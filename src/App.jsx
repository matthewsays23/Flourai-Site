import React from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthSuccess from "./pages/AuthSuccess";

export default function App() {
  const path = window.location.pathname;

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/auth/success") return <AuthSuccess />;

  return <Home />;
}
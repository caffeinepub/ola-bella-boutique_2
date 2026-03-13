import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AdminPage from "./pages/AdminPage";
import CatalogPage from "./pages/CatalogPage";

function Router() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  if (path === "/admin" || path.startsWith("/admin")) {
    return (
      <AdminPage
        navigate={(p) => {
          window.history.pushState({}, "", p);
          setPath(p);
        }}
      />
    );
  }

  return (
    <CatalogPage
      navigate={(p) => {
        window.history.pushState({}, "", p);
        setPath(p);
      }}
    />
  );
}

export default function App() {
  return (
    <>
      <Router />
      <Toaster richColors position="top-right" />
    </>
  );
}

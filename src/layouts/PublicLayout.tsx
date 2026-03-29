import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout() {
  const location = useLocation();

  // Scroll to top on route change for a smooth page transition feel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

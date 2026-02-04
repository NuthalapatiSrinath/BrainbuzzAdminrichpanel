import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer"; // Import the single file Footer

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      if (!mobile && !isSidebarOpen) setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-page text-text-main transition-colors duration-300 font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
        ${!isMobile ? "ml-[72px]" : "ml-0"}`}
      >
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* The New Footer */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;

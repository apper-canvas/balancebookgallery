import { Outlet } from "react-router-dom";
import React from "react";
import Sidebar from "@/components/organisms/Sidebar";
import MobileNav from "@/components/organisms/MobileNav";

const Layout = () => {
  // App-level state and methods can be defined here
  // and passed to child routes via outlet context
  const outletContext = {
    // Add any app-level state or methods here that need to be
    // shared across all routes via useOutletContext()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:block" />
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-20 lg:pt-0">
        <main className="p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
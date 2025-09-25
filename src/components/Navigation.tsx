// src/components/Navigation.js

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    // Changed to a white, slightly transparent background with a border
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GitStats</span>
          </Link>

          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              to="/"
              className={`transition-colors hover:text-gray-900 ${
                isActive("/") ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Home
            </Link>
            <Link
              to="/public-stats"
              className={`transition-colors hover:text-gray-900 ${
                isActive("/public-stats") ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Public Stats
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`transition-colors hover:text-gray-900 ${
                  isActive("/dashboard") ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/public-stats">
              <Button
                variant="default"
                className="group hidden bg-gray-900 text-white hover:bg-gray-800 sm:inline-flex"
              >
                <span>Analyze</span>
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Building2, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronDown,
  Settings,
  HelpCircle,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to create page URLs
const createPageUrl = (pageName) => '/' + pageName.toLowerCase().replace(/ /g, '-');

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.auth.me().then(setUser);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-300">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  PrimeBroward
                </h1>
                <p className="text-xs text-slate-500 -mt-0.5 font-medium">Wholesale Real Estate CRM</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'text-blue-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-blue-100/80 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/60 rounded-xl">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-100 ring-offset-2">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-slate-800">
                          {user.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500 capitalize font-medium">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200/50">
                    <div className="px-3 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg mx-1">
                        <User className="h-4 w-4" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg mx-1">
                        <Settings className="h-4 w-4" />
                        Preferences
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg mx-1">
                        <HelpCircle className="h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg mx-1 mb-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden hover:bg-white/60 rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100/50 bg-white/90 backdrop-blur-lg"
            >
              <nav className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Home className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">PrimeBroward CRM</span>
              <span className="text-slate-300">•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <p className="flex items-center gap-2 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to local database
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

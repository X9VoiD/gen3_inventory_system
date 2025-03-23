import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ReceiptText, LogOut, Users, Search, Menu, X, Boxes } from 'lucide-react';
import { useAuth } from '../providers/auth-provider';
import { useState, useEffect } from 'react';
import { NotificationProvider } from "../providers/notification-provider";
import NotificationArea from "./notification-area";

const AppShell = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { icon: <Package />, label: 'Inventory', path: '/products' },
    { icon: <ReceiptText />, label: 'Transactions', path: '/transactions' },
    { icon: <Users />, label: 'Users', path: '/users' },
    { icon: <Boxes />, label: 'Suppliers', path: '/suppliers' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <NotificationProvider>
      <div className="flex flex-col h-screen max-h-screen bg-ashley-background">
        {/* Top header bar */}
        <header
          className={`w-full h-16 bg-ashley-gray-9 z-10 transition-all duration-200 ${
            isScrolled ? 'shadow-md' : ''
          }`}
        >
          <div className="px-4 md:px-8 h-full flex items-center justify-between">
            {/* Logo and mobile menu toggle */}
            <div className="flex items-center">
              <button
                className="mr-4 md:hidden text-ashley-gray-1 hover:cursor-pointer"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <img src="/icon.svg" alt="Logo" className="ml-2 md:ml-0 h-6 w-6 mr-4" />
              <div className="text-xl text-ashley-gray-1">Inventory Manager</div>
            </div>

            {/* Search bar - hidden on mobile, shown on desktop */}
            <div className="hidden md:block flex-grow max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inventory, transactions..."
                  className="input w-full px-4 py-2 rounded-md  pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-ashley-gray-7" />
              </div>
            </div>

            {/* User profile section */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-ashley-gray-1 text-ashley-gray-12 flex items-center justify-center mr-2">
                A
              </div>
              <span className="hidden md:inline text-sm font-medium text-ashley-gray-1">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Mobile search - only visible on small screens */}
        <div className="md:hidden px-4 py-2 bg-ashley-gray-1 border-b border-ashley-gray-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-md pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-ashley-gray-7" />
          </div>
        </div>

        <div className="flex grow overflow-hidden">
          {/* Mobile navigation overlay */}
          <div
            className={`md:hidden fixed inset-0 bg-ashley-gray-12 z-20 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-50 visible' : 'opacity-0 invisible'
            }`}
            onClick={toggleMobileMenu}
          ></div>

          {/* Side navigation */}
          <nav
            className={`fixed md:relative z-30 md:z-auto h-full bg-ashley-gray-10 text-ashley-gray-1 inset-y-0
            ${isMobileMenuOpen ? 'left-0' : '-left-64'} md:left-0 md:inset-y-auto
            w-64 md:w-64 transition-all duration-300 shadow-lg md:shadow-none`}
          >
            <div className="flex flex-col h-full">
              <div className="md:hidden h-16 flex pl-8 items-center border-b border-ashley-gray-8 md:pt-8">
                <img src="/icon.svg" alt="Logo" className="h-6 w-6" />
              </div>

              <ul className="flex-grow overflow-y-auto py-4">
                {navItems.map((item) => (
                  <li key={item.path} className="px-4 py-2">
                    <Link
                      to={item.path}
                      className={`flex items-center p-2 rounded-md transition ${
                        isActive(item.path)
                          ? 'bg-ashley-gray-8 text-ashley-gray-1'
                          : 'text-ashley-gray-1 hover:bg-ashley-gray-8'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="p-4 border-t border-ashley-gray-8">
                <button
                  className="flex items-center p-2 w-full rounded-md text-ashley-gray-1 hover:bg-ashley-gray-8 hover:cursor-pointer transition"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main content area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
        <NotificationArea />
      </div>
    </NotificationProvider>
  );
};

export default AppShell;

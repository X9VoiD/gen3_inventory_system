import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ReceiptText, LogOut, Users, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../providers/auth-provider';
import { useState, useEffect } from 'react';

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
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Top header bar */}
      <header className={`w-full h-16 bg-ashley-gray z-10 transition-all duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo and mobile menu toggle */}
          <div className="flex items-center">
            <button
              className="mr-4 md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="text-xl text-white">Inventory Manager</div>
          </div>

          {/* Search bar - hidden on mobile, shown on desktop */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search inventory, transactions..."
                className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* User profile section */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-2">
              A
            </div>
            <span className="hidden md:inline text-sm font-medium">Admin</span>
          </div>
        </div>
      </header>

      {/* Mobile search - only visible on small screens */}
      <div className="md:hidden px-4 py-2 bg-white border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex grow overflow-hidden">
        {/* Mobile navigation overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleMobileMenu}></div>
        )}

        {/* Side navigation */}
        <nav className={`
          fixed md:relative z-30 md:z-auto h-full bg-emerald-700 text-white
          ${isMobileMenuOpen ? 'left-0' : '-left-64'} md:left-0
          w-64 md:w-64 transition-all duration-300 shadow-lg md:shadow-none
        `}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-emerald-600 md:pt-8">
              <h2 className="text-xl font-bold md:hidden">Inventory Manager</h2>
            </div>

            <ul className="flex-grow overflow-y-auto py-4">
              {navItems.map((item) => (
                <li key={item.path} className="px-4 py-2">
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-lg transition ${
                      isActive(item.path)
                        ? 'bg-emerald-800 text-white'
                        : 'text-emerald-100 hover:bg-emerald-800'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="p-4 border-t border-emerald-600">
              <button
                className="flex items-center p-2 w-full rounded-lg text-emerald-100 hover:bg-emerald-800 transition"
                onClick={handleLogout}
              >
                <LogOut className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
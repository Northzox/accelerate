import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import UserMenu from './UserMenu';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and main navigation */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="/icons/main.png"
                  alt="ValandWaffen"
                  className="h-8 w-8 rounded-lg"
                />
                <span className="text-xl font-bold text-white">ValandWaffen</span>
              </Link>
              
              {isAuthenticated && (
                <div className="hidden md:block ml-10">
                  <Navigation />
                </div>
              )}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Desktop user menu */}
                  <div className="hidden md:block">
                    <UserMenu user={user} />
                  </div>
                  
                  {/* Mobile menu button */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMobileMenuOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                !isLoading && (
                  <div className="flex items-center space-x-4">
                    <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="btn btn-primary text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <MobileMenu user={user} onClose={() => setIsMobileMenuOpen(false)} />
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img
                src="/icons/main.png"
                alt="ValandWaffen"
                className="h-6 w-6 rounded-lg"
              />
              <span className="text-sm text-gray-400">© 2024 ValandWaffen. All rights reserved.</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Community Guidelines
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

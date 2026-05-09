'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Vote, Menu, X, LogOut, User, Settings, BarChart3 } from 'lucide-react';

interface NavbarProps {
  userRole?: 'user' | 'admin';
  userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = userRole === 'admin';
  const baseUrl = isAdmin ? '/admin' : '/user';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href={`${baseUrl}/dashboard`} className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VoteSecure</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href={`${baseUrl}/dashboard`}
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            
            {isAdmin ? (
              <>
                <Link 
                  href="/admin/elections"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Elections
                </Link>
                <Link
                  href="/admin/candidates"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Candidates
                </Link>
                <Link
                  href="/admin/electors"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Electors
                </Link>
                <Link
                  href="/admin/results"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Results
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/user/elections"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Elections
                </Link>
                <Link 
                  href="/user/results"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Results
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span>{userName || 'User'}</span>
              <span className={`badge ${isAdmin ? 'badge-blue' : 'badge-green'}`}>
                {userRole?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link 
                href={`${baseUrl}/dashboard`}
                className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {isAdmin ? (
                <>
                  <Link 
                    href="/admin/elections"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Elections
                  </Link>
                  <Link
                    href="/admin/candidates"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Candidates
                  </Link>
                  <Link
                    href="/admin/electors"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Electors
                  </Link>
                  <Link
                    href="/admin/results"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Results
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/user/elections"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Elections
                  </Link>
                  <Link 
                    href="/user/results"
                    className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Results
                  </Link>
                </>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span>{userName || 'User'}</span>
                    <span className={`badge ${isAdmin ? 'badge-blue' : 'badge-green'}`}>
                      {userRole?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 text-base font-medium"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
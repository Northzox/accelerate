import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'text-red-400',
      'Leader': 'text-purple-400',
      'Co-Leader': 'text-indigo-400',
      'Official Member': 'text-green-400',
      'User': 'text-gray-400'
    };
    return colors[role] || 'text-gray-400';
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Admin': 'badge-admin',
      'Leader': 'badge-leader',
      'Co-Leader': 'badge-coleader',
      'Official Member': 'badge-member'
    };
    return colors[badge] || '';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="hidden lg:block text-left">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white">{user.username}</p>
              {user.badges.map((badge, index) => (
                <span key={index} className={`badge ${getBadgeColor(badge)}`}>
                  {badge}
                </span>
              ))}
            </div>
            <p className={`text-xs ${getRoleColor(user.role)}`}>
              {user.role} • Level {user.level}
            </p>
          </div>
        </div>
        
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className={`text-xs ${getRoleColor(user.role)}`}>
                {user.role} • Level {user.level}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {user.xp} XP
              </p>
            </div>

            {/* Menu items */}
            <Link href="/profile">
              <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                👤 Profile
              </div>
            </Link>
            
            <Link href="/settings">
              <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                ⚙️ Settings
              </div>
            </Link>

            {(user.role === 'Admin' || user.role === 'Co-Leader' || user.role === 'Leader') && (
              <Link href="/admin">
                <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                  🛡️ Admin Panel
                </div>
              </Link>
            )}

            <div className="border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

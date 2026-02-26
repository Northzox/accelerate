import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const MobileMenu = ({ user, onClose }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path) => {
    return router.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    onClose();
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

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/forum', label: 'Forum', icon: '💬' },
    { path: '/chat', label: 'Live Chat', icon: '💭' },
    { path: '/tickets', label: 'Tickets', icon: '🎫' },
    { path: '/members', label: 'Members', icon: '👥' },
  ];

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 border-t border-gray-700">
        {/* User info */}
        <div className="px-3 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <p className="text-sm font-medium text-white">{user.username}</p>
                {user.badges.map((badge, index) => (
                  <span key={index} className={`badge ${getBadgeColor(badge)}`}>
                    {badge}
                  </span>
                ))}
              </div>
              <p className={`text-xs ${getRoleColor(user.role)}`}>
                {user.role} • Level {user.level} • {user.xp} XP
              </p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              onClick={onClose}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}

        {/* Additional menu items */}
        <div className="border-t border-gray-700 pt-1">
          <Link href="/profile">
            <div
              onClick={onClose}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="mr-3">👤</span>
              Profile
            </div>
          </Link>
          
          <Link href="/settings">
            <div
              onClick={onClose}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="mr-3">⚙️</span>
              Settings
            </div>
          </Link>

          {(user.role === 'Admin' || user.role === 'Co-Leader' || user.role === 'Leader') && (
            <Link href="/admin">
              <div
                onClick={onClose}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <span className="mr-3">🛡️</span>
                Admin Panel
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

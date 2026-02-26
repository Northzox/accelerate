import Link from 'next/link';
import { useRouter } from 'next/router';

const Navigation = () => {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/forum', label: 'Forum', icon: '💬' },
    { path: '/chat', label: 'Live Chat', icon: '💭' },
    { path: '/tickets', label: 'Tickets', icon: '🎫' },
    { path: '/members', label: 'Members', icon: '👥' },
  ];

  return (
    <nav className="flex space-x-1">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive(item.path)
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;

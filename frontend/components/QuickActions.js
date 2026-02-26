import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

const QuickActions = () => {
  const { isAuthenticated, user } = useAuth();

  const actions = [
    {
      title: 'Create Thread',
      description: 'Start a new discussion',
      icon: '💬',
      link: '/forum/create',
      color: 'from-blue-500 to-blue-600',
      requireAuth: true,
    },
    {
      title: 'Open Ticket',
      description: 'Submit recruitment application',
      icon: '🎫',
      link: '/tickets/create',
      color: 'from-green-500 to-green-600',
      requireAuth: true,
    },
    {
      title: 'Join Chat',
      description: 'Enter live conversation',
      icon: '💭',
      link: '/chat',
      color: 'from-purple-500 to-purple-600',
      requireAuth: true,
    },
    {
      title: 'View Members',
      description: 'Browse community members',
      icon: '👥',
      link: '/members',
      color: 'from-indigo-500 to-indigo-600',
      requireAuth: true,
    },
  ];

  const filteredActions = actions.filter(action => 
    !action.requireAuth || isAuthenticated
  );

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
      
      <div className="space-y-3">
        {filteredActions.map((action, index) => (
          <Link key={index} href={action.link}>
            <div className="group flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 cursor-pointer">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-lg">{action.icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {action.description}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">🔒 Authentication Required</h4>
          <p className="text-xs text-gray-400 mb-3">
            Sign in to access all features and join the community.
          </p>
          <div className="flex space-x-2">
            <Link href="/login" className="btn btn-primary text-xs px-3 py-1">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-secondary text-xs px-3 py-1">
              Register
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && user?.role === 'User' && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">🎯 Want to level up?</h4>
          <p className="text-xs text-gray-400 mb-3">
            Participate in discussions and help others to gain XP and unlock new privileges.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">
              Current: Level {user.level} ({user.xp} XP)
            </span>
            <Link href="/profile" className="text-xs text-blue-400 hover:text-blue-300">
              View Progress →
            </Link>
          </div>
        </div>
      )}

      {(user?.role === 'Admin' || user?.role === 'Co-Leader' || user?.role === 'Leader') && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">🛡️ Admin Tools</h4>
          <p className="text-xs text-gray-400 mb-3">
            Manage the community and moderate content.
          </p>
          <Link href="/admin" className="btn btn-danger text-xs px-3 py-1">
            Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuickActions;

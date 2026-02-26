import { useState, useEffect } from 'react';
import Link from 'next/link';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching recent activity
    const fetchActivity = async () => {
      try {
        // Mock data - in real app, this would be an API call
        const mockActivities = [
          {
            id: 1,
            type: 'forum_thread',
            user: { username: 'StrategicCommander', role: 'Leader', badges: ['Leader'] },
            action: 'created a new thread',
            target: 'Advanced Tactics Discussion',
            timestamp: '2 minutes ago',
            link: '/forum/thread/1',
          },
          {
            id: 2,
            type: 'chat_message',
            user: { username: 'EliteOperator', role: 'Official Member', badges: ['Official Member'] },
            action: 'sent a message in',
            target: 'Global Chat',
            timestamp: '5 minutes ago',
            link: '/chat',
          },
          {
            id: 3,
            type: 'ticket_created',
            user: { username: 'NewRecruit', role: 'User', badges: [] },
            action: 'opened a recruitment ticket',
            target: 'Application for Squad Alpha',
            timestamp: '10 minutes ago',
            link: '/tickets',
          },
          {
            id: 4,
            type: 'forum_reply',
            user: { username: 'TacticalAdvisor', role: 'Co-Leader', badges: ['Co-Leader'] },
            action: 'replied to',
            target: 'Mission Planning Strategies',
            timestamp: '15 minutes ago',
            link: '/forum/thread/2',
          },
          {
            id: 5,
            type: 'level_up',
            user: { username: 'RisingStar', role: 'Official Member', badges: ['Official Member'] },
            action: 'reached level',
            target: 'Level 15',
            timestamp: '20 minutes ago',
            link: '/profile/RisingStar',
          },
        ];

        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();

    // Set up real-time updates
    const interval = setInterval(fetchActivity, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type) => {
    const icons = {
      forum_thread: '💬',
      forum_reply: '↩️',
      chat_message: '💭',
      ticket_created: '🎫',
      level_up: '⭐',
    };
    return icons[type] || '📌';
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

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <span className="text-xs text-gray-400">Live updates</span>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <div className="flex-shrink-0 text-xl">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {activity.user.username}
                </span>
                {activity.user.badges.map((badge, index) => (
                  <span key={index} className={`badge ${getBadgeColor(badge)}`}>
                    {badge}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-gray-300 mb-1">
                {activity.action}{' '}
                <Link href={activity.link} className="text-blue-400 hover:text-blue-300 font-medium">
                  {activity.target}
                </Link>
              </p>
              
              <p className="text-xs text-gray-500">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">No recent activity</div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

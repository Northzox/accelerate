import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalThreads: 0,
    totalMessages: 0,
    activeTickets: 0,
  });

  useEffect(() => {
    // Fetch stats when component mounts
    const fetchStats = async () => {
      try {
        // In a real app, these would be actual API calls
        setStats({
          totalUsers: 1247,
          totalThreads: 384,
          totalMessages: 12547,
          activeTickets: 23,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <Stats stats={stats} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            {/* Quick Actions */}
            <div>
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

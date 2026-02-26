import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

const Hero = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="text-gradient">ValandWaffen</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            The elite community platform for strategic discussions, real-time collaboration, and exclusive recruitment opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link href="/forum" className="btn btn-primary text-lg px-8 py-3">
                  🚀 Enter Forum
                </Link>
                <Link href="/chat" className="btn btn-secondary text-lg px-8 py-3">
                  💬 Join Chat
                </Link>
                {user?.role === 'User' && (
                  <Link href="/tickets" className="btn btn-success text-lg px-8 py-3">
                    🎫 Open Ticket
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
                  ⚡ Join Now
                </Link>
                <Link href="/login" className="btn btn-secondary text-lg px-8 py-3">
                  🔐 Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2">Forum Discussions</h3>
              <p className="text-gray-300 text-sm">Engage in strategic conversations with elite members</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-300 text-sm">Real-time communication with the community</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-lg font-semibold text-white mb-2">Recruitment</h3>
              <p className="text-gray-300 text-sm">Private ticket system for exclusive opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default Hero;

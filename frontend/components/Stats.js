const Stats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Members',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Forum Threads',
      value: stats.totalThreads.toLocaleString(),
      icon: '💬',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Chat Messages',
      value: stats.totalMessages.toLocaleString(),
      icon: '💭',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Active Tickets',
      value: stats.activeTickets.toLocaleString(),
      icon: '🎫',
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <section className="py-12 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Platform Statistics</h2>
          <p className="text-gray-400">Real-time metrics from our thriving community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="card hover-lift text-center"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} mb-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              
              <div className="text-sm text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

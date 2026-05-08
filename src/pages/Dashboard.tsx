import { Users, Bike, Package, TrendingUp } from 'lucide-react';
import { useDashboardQuery } from '../hooks/useApiQueries';
import { StatCard, LoadingSpinner, EmptyState, Card } from '../components/ui';

const Dashboard = () => {
  const { data: dashboardData, isLoading, isError } = useDashboardQuery();

  if (isLoading) return <LoadingSpinner />;

  if (isError || !dashboardData) {
    return <EmptyState message="Failed to load dashboard data" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-aiko-dark-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your business overview</p>
      </div>

      {/* Stats Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Total Users"
          value={dashboardData?.totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Total Riders"
          value={dashboardData?.totalRiders || 0}
          icon={<Bike className="w-6 h-6" />}
        />
        <StatCard
          label="Total Orders"
          value={dashboardData?.totalOrders || 0}
          icon={<Package className="w-6 h-6" />}
        />
        <StatCard
          label="Revenue"
          value={`₦${dashboardData?.totalRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Charts and Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-aiko-dark-900 dark:text-white mb-4">Activity Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-aiko-dark-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Chart component coming soon</p>
          </div>
        </Card>

        {/* Right Sidebar */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-aiko-dark-900 dark:text-white mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-aiko-dark-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-aiko-green-500">{dashboardData?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-aiko-dark-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending KYC</span>
              <span className="font-semibold text-aiko-green-500">{dashboardData?.pendingKyc || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-semibold text-aiko-green-500">{dashboardData?.conversionRate || '0'}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
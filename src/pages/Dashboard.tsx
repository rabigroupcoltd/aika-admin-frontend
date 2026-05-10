import React from 'react';
import { Users, Bike, Package, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useDashboardQuery, useDashboardAnalyticsQuery } from '../hooks/useApiQueries';
import { StatCard, LoadingSpinner, EmptyState, Card } from '../components/ui';

const Dashboard = () => {
  const { data: dashboardData, isLoading: isStatsLoading, isError: isStatsError } = useDashboardQuery();
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useDashboardAnalyticsQuery();

  if (isStatsLoading || isAnalyticsLoading) return <LoadingSpinner />;

  if (isStatsError || !dashboardData) {
    return <EmptyState message="Failed to load dashboard data" />;
  }

  // Mock data for order status distribution
  const orderDistribution = [
    { name: 'Delivered', value: 400, color: '#10B981' },
    { name: 'Pending', value: 300, color: '#F59E0B' },
    { name: 'Cancelled', value: 100, color: '#EF4444' },
    { name: 'In Progress', value: 200, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your business overview</p>
        </div>
        <div className="hidden md:block text-sm text-gray-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Total Users"
          value={dashboardData?.totalUsers?.toLocaleString() || 0}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Total Riders"
          value={dashboardData?.totalRiders?.toLocaleString() || 0}
          icon={<Bike className="w-6 h-6" />}
        />
        <StatCard
          label="Total Orders"
          value={dashboardData?.totalOrders?.toLocaleString() || 0}
          icon={<Package className="w-6 h-6" />}
        />
        <StatCard
          label="Revenue"
          value={`₦${dashboardData?.totalRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Analytics</h2>
            <select className="bg-gray-50 dark:bg-slate-700 border-none text-sm rounded-md focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.monthlyTransactions || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}}
                  tickFormatter={(value) => `₦${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {orderDistribution.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-4">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Active Users</p>
                  <p className="text-xs text-gray-500">Users active in last 24h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dashboardData?.activeUsers || 0}</p>
                <p className="text-xs text-green-500 flex items-center justify-end">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 12%
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 mr-4">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pending KYC</p>
                  <p className="text-xs text-gray-500">Awaiting approval</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{dashboardData?.pendingKyc || 0}</p>
                <p className="text-xs text-red-500 flex items-center justify-end">
                  <ArrowUp className="w-3 h-3 mr-0.5" /> 5%
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Order Completion Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-aiko-green-500 h-2 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Rider Satisfaction</span>
                <span className="font-semibold text-gray-900 dark:text-white">4.8/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">{dashboardData?.conversionRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${dashboardData?.conversionRate || 0}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
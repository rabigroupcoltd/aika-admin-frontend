import React from 'react';
import { Bike, Search, Filter, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useRidersQuery } from '../hooks/useApiQueries';
import { Table, LoadingSpinner, EmptyState, Card } from '../components/ui';

const Riders = () => {
  const { data: riders, isLoading, isError } = useRidersQuery();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message="Failed to load riders" />;

  const headers = ['Rider', 'Contact', 'Vehicle', 'Status', 'KYC', 'Joined'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'SUSPENDED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Riders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage delivery personnel and verification status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search riders..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-aiko-green-500 outline-none transition-all"
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table headers={headers}>
          {riders?.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-500">
                No riders found
              </td>
            </tr>
          ) : (
            riders?.map((rider) => (
              <tr key={rider.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-aiko-green-100 dark:bg-aiko-green-900 flex items-center justify-center mr-3">
                      <Bike className="w-4 h-4 text-aiko-green-600 dark:text-aiko-green-300" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{rider.profile?.name || 'Unnamed Rider'}</div>
                      <div className="text-xs text-gray-500">{rider.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {rider.profile?.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{rider.vehicle?.type || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{rider.vehicle?.plateNumber || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`flex items-center text-sm font-medium ${getStatusColor(rider.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${rider.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {rider.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rider.driverStatus === 'APPROVED' ? (
                    <span className="flex items-center text-xs font-semibold text-green-600">
                      <ShieldCheck className="w-4 h-4 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-semibold text-yellow-600">
                      <ShieldAlert className="w-4 h-4 mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Assuming we might add a createdAt later, or just mock it */}
                  Joined recently
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
};

export default Riders;

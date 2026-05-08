import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useUsersQuery } from '../hooks/useApiQueries';
import { Card, Table, LoadingSpinner, EmptyState } from '../components/ui';
import type { User } from '../types';

const Users = () => {
  const { data: users = [], isLoading, isError } = useUsersQuery();

  if (isLoading) return <LoadingSpinner />;

  if (isError || !users) {
    return <EmptyState message="Failed to load users" />;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      case 'SUSPENDED':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-aiko-dark-900 dark:text-white">Users Management</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Manage all registered users and their profiles
        </p>
      </div>

      <Card>
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-aiko-dark-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-aiko-dark-900 dark:text-white">All Users</h2>
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">{users.length} total</span>
          </div>
        </div>

        {users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Name', 'Email', 'Status', 'Driver Status']}>
              {users.map((user: User) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-aiko-dark-800 transition-colors text-sm"
                >
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-aiko-dark-900 dark:text-white">
                      {user.profile?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2 hidden sm:inline" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <span className="w-2 h-2 mr-2 rounded-full bg-current"></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm">
                    {user.driverStatus === 'APPROVED' ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1 hidden sm:inline" />
                        <span className="hidden sm:inline">Approved</span>
                        <span className="sm:hidden">✓</span>
                      </div>
                    ) : user.driverStatus === 'PENDING' ? (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="w-4 h-4 mr-1 hidden sm:inline" />
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">⏳</span>
                      </div>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Users;
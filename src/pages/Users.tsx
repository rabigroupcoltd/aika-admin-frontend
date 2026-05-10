import { useState, useMemo } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Phone, 
  ShieldCheck, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUsersQuery } from '../hooks/useApiQueries';
import { Card, Table, LoadingSpinner, EmptyState, Button, Badge } from '../components/ui';
import type { User, QueryParams } from '../types';

const Users = () => {
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'RIDER'>('CUSTOMER');
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    size: 10,
    search: '',
    role: 'CUSTOMER',
    status: '',
  });

  const { data, isLoading, isError } = useUsersQuery({ ...params, role: activeTab });

  const handleTabChange = (tab: 'CUSTOMER' | 'RIDER') => {
    setActiveTab(tab);
    setParams(prev => ({ ...prev, page: 1, role: tab }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingSpinner />;

  const users = data?.result || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your application's user base and their permissions
          </p>
        </div>
        
        <div className="flex p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border">
          <button
            onClick={() => handleTabChange('CUSTOMER')}
            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === 'CUSTOMER'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Passengers
          </button>
          <button
            onClick={() => handleTabChange('RIDER')}
            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
              activeTab === 'RIDER'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Drivers
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl">
        {/* Filters and Search Bar */}
        <div className="p-6 md:p-8 border-b border-border flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={params.search}
                onChange={handleSearchChange}
                placeholder={`Search ${activeTab.toLowerCase()}s...`}
                className="w-full pl-12 pr-5 py-3.5 bg-background/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
            
            <select
              value={params.status}
              onChange={handleStatusChange}
              className="px-5 py-3.5 bg-background/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-bold text-foreground/80 appearance-none min-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <Button className="w-full sm:w-auto rounded-2xl px-8 py-4 font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
            <UserPlus className="w-5 h-5" />
            Add {activeTab === 'CUSTOMER' ? 'Passenger' : 'Driver'}
          </Button>
        </div>

        {/* Table Content */}
        {isError ? (
          <div className="p-20">
            <EmptyState message="Something went wrong while fetching users. Please try again." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-20">
            <EmptyState message={`No ${activeTab.toLowerCase()}s found matching your criteria.`} />
          </div>
        ) : (
          <>
            <Table headers={['Full Name', 'Email Address', 'Phone Number', 'Status', 'Actions']}>
              {users.map((user: User) => (
                <tr key={user.id} className="group hover:bg-muted/30 transition-all duration-300">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner overflow-hidden">
                        {user.profile?.avatar ? (
                          <img src={user.profile.avatar} alt={user.profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-lg">
                            {(user.profile?.name || user.email)?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                          {user.profile?.name || 'Unnamed User'}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                          ID: {user.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-foreground/70 font-medium">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-foreground/70 font-medium">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {user.phoneNumber || user.profile?.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'error' : 'neutral'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination Component */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <div className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-foreground font-bold">{(params.page! - 1) * params.size! + 1}</span> to <span className="text-foreground font-bold">{Math.min(params.page! * params.size!, data?.totalItems || 0)}</span> of <span className="text-foreground font-bold">{data?.totalItems}</span> users
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(params.page! - 1)}
                  disabled={params.page === 1}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="flex gap-1.5">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                params.page === i + 1
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'hover:bg-muted text-muted-foreground'
                            }`}
                        >
                            {i + 1}
                        </button>
                    )).slice(0, 5)} {/* Limit page numbers for brevity */}
                    {totalPages > 5 && <span className="flex items-center px-2 text-muted-foreground">...</span>}
                </div>
                <button
                  onClick={() => handlePageChange(params.page! + 1)}
                  disabled={params.page === totalPages}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Users;
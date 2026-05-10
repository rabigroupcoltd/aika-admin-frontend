import { Link, useLocation } from 'react-router-dom';
import { Users, BarChart3, CheckCircle, CreditCard, Wallet } from 'lucide-react';
import { AikaLogo } from './AikaLogo';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/kyc', icon: CheckCircle, label: 'KYC Approvals' },
    { path: '/payouts', icon: CreditCard, label: 'Payouts' },
    { path: '/wallets', icon: Wallet, label: 'Wallets' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 w-64 shadow-lg border-r border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <AikaLogo className="w-40" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-aiko-green-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Aiko Admin Portal v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
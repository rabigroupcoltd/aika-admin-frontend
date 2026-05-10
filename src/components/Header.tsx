import { Bell, User, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm px-6 py-4 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-aiko-green-500 dark:hover:text-aiko-green-400 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-aiko-green-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-aiko-green-500 dark:hover:text-aiko-green-400 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-6 border-l border-gray-200 dark:border-aiko-dark-700">
            <div className="w-8 h-8 bg-gradient-to-br from-aiko-green-500 to-aiko-dark-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
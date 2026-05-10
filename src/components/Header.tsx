import { Bell, User, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLogoutMutation } from '../hooks/useApiQueries';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem('admin_token');
        navigate('/login');
      },
    });
  };

  return (
    <header className="bg-background shadow-sm px-6 py-4 border-b border-border transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <button className="relative p-2.5 text-muted-foreground hover:text-primary transition-colors bg-muted/50 rounded-xl border border-transparent hover:border-primary/20">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-muted-foreground hover:text-primary transition-colors bg-muted/50 rounded-xl border border-transparent hover:border-primary/20"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4 pl-6 border-l border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-foreground">Admin</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manager</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
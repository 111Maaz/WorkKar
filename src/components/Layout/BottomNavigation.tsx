import React from 'react';
import { Home, Search, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onSearchClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onSearchClick }) => {
  const currentPath = window.location.pathname;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Search, path: '#', action: onSearchClick },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          const element = item.action ? (
            <button
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-gray-500 hover:text-gray-700"
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <a
              key={item.id}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          );
          return element;
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

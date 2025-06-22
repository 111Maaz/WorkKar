import React, { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-card shadow-sm fixed w-full z-10 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/WorkKar icon.png" alt="WorkKar Logo" className="w-16 h-16 rounded-full object-cover" />
              <span className="text-primary font-bold text-xl">Work<span className="text-secondary">Kar</span></span>
            </a>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background" 
                  onClick={() => window.location.href = '/profile'}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background" 
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background" 
                onClick={() => window.location.href = '/auth'}
              >
                <User size={18} />
                <span>Sign In</span>
              </Button>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground/80 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-card shadow-md">
          {user ? (
            <>
              <button 
                onClick={() => {
                  window.location.href = '/profile';
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-md"
              >
                Profile
              </button>
              <button 
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                window.location.href = '/auth';
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-md"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

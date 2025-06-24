import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || isAdmin === null) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return <div>Access Denied</div>;
  return <>{children}</>;
};

export default ProtectedRoute; 
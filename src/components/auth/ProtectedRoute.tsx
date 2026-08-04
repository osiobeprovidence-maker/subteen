import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  roles?: string[];
  children: React.ReactNode;
}

export const ProtectedRoute = ({ roles, children }: ProtectedRouteProps) => {
  const { isLoggedIn, loading, dbUser, role } = useAuth();
  const location = useLocation();

  if (loading || (isLoggedIn && !dbUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B8FF4D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

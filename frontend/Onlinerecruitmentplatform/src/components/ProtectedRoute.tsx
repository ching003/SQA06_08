import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/types';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    // Redirect to login page, saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.RECRUITER:
        return <Navigate to="/recruiter/dashboard" replace />;
      case UserRole.CANDIDATE:
        return <Navigate to="/candidate/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the required role
  return <>{children}</>;
}

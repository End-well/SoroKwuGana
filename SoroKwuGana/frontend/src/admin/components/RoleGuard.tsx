import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { atLeast, type Role } from '../lib/roles';

interface Props {
  minRole: Role;
  children: React.ReactNode;
  /** Where to redirect if access denied. Defaults to /admin */
  fallback?: string;
}

/**
 * Wraps a route or component and redirects if the current user
 * doesn't have the required minimum role.
 */
export default function RoleGuard({ minRole, children, fallback = '/admin' }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !atLeast(user.role, minRole)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

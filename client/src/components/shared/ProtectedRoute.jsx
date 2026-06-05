import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ allowedRoles }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const roleRedirectMap = {
    admin: "/admin/dashboard",
    lawyer: "/lawyer/dashboard",
    client: "/client/dashboard",
  };

  const userRole = user?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={roleRedirectMap[userRole] ?? "/login"} replace />;
  }

  return <Outlet />;
}

import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};
export const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
export default ProtectedRoute;

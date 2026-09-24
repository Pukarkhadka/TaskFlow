import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullSpinner } from "./spinners";

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  if (loading) return <FullSpinner />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
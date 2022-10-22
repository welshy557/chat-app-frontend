import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./hooks/useAuth";

export default function ProtectedRoute() {
  const { storedToken, storedUser } = useAuth();
  return storedToken && storedUser ? <Outlet /> : <Navigate to="/" />;
}

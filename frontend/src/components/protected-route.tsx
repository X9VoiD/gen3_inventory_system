import { useAuth } from "../providers/auth-provider";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children || <Outlet />;
};

export default ProtectedRoute;
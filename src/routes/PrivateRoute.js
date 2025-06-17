import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
    const { access } = useAuth();

    if (!access) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;

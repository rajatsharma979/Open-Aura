import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        axios
        .post("http://localhost:3000/isAuthenticated",
            {}, 
            { headers: { "Content-Type": "application/json" },
            withCredentials: true })
        .then((result) => {console.log(result);setIsAuthenticated(true)})
        .catch(() => setIsAuthenticated(false));
    }, []);

    if (isAuthenticated === null) {
        return <p>Loading...</p>; // Placeholder while checking auth
    }

    return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;

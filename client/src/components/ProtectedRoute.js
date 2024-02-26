import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ element, ...rest }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated) {
        return <Route {...rest} element={element} />;
    } else {
        return <Navigate to="/login" />;
    }
}

export default ProtectedRoute;

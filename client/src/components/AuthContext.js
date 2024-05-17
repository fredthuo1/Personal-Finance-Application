import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const decodeToken = (token) => {
    console.log('Original Token:', token);
    try {
        const payload = token.split('.')[1];
        console.log('Encoded Payload:', payload);
        const decodedPayload = atob(payload);
        console.log('Decoded Payload:', decodedPayload);
        const parsedPayload = JSON.parse(decodedPayload);
        console.log('Parsed Payload:', parsedPayload);
        return parsedPayload.user ? parsedPayload.user.id : null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedUserId = decodeToken(token);
        setUserId(decodedUserId);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserId(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        const decodedUserId = decodeToken(token);
        setUserId(decodedUserId);
        setIsAuthenticated(!!decodedUserId);
    }, []);

    const value = {
        isAuthenticated,
        userId,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

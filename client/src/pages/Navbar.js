import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const Navbar = () => {
    const { isAuthenticated } = useAuth();

    return (
        <nav className="navbar">
            <h2 className="navbar-brand">Personal Finance Advisor</h2>
            <div className="navbar-links">
                {!isAuthenticated && (
                    <>
                        <Link to="/sign-up" className="navbar-link">Signup</Link>
                        <Link to="/login" className="navbar-link">Login</Link>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <Link to="/upload-data" className="navbar-link">Upload Transaction Data</Link>
                        <Link to="/transactions" className="navbar-link">Transactions</Link>
                        <Link to="/monthly-transactions" className="navbar-link">Monthly Transactions</Link>
                        <Link to="/weekly-transactions" className="navbar-link">Weekly Transactions</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
